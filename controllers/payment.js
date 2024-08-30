const Coinpayments = require("coinpayments");
const { StatusCodes } = require("http-status-codes");
const { getBalanceByUserId, updateBalance } = require("../services/balance");
const { createTransaction, updateTransactionById } = require("../services/transaction");
const { readAllWallets, updateWalletDoc, readWallet } = require("../services/wallet");
const { sendTransfer, getDeploy } = require("../utils/cspr");
const { decryptDataWithPassphrase, sleep } = require("../utils/helpers");
const fs = require('fs')
const Web3 = require('web3');
const web3 = new Web3(process.env.ETHEREUM_TESTNET_PROVIDER);
const path = require('path')


const getDepositAddress = async (req, res) => {
  try {
    let { options } = req.query;
    if (options) {
      options = JSON.parse(options);
    }
    const client = new Coinpayments({
      key: process.env.COINPAYMENTS_KEY,
      secret: process.env.COINPAYMENTS_SECRET
    });
    const { address } = await client.getCallbackAddress({
      currency: options.currency
    });
    await createTransaction({
      userId: options.id,
      type: "Deposit",
      currency: options.currency,
      to: address,
      status: "Started"
    });
    res.status(StatusCodes.OK).json({ success: true, address });
  } catch (err) {
    console.log(
      "🚀 ~ file: payment.js ~ line 31 ~ getDepositAddress ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const generateWithdrawal = async (req, res) => {
  try {
    let { options } = req.body;
    const { CSPR_WALLET_ADDRESS, CSPR_NODE_ADDRESS } = process.env;
    const balance = await getBalanceByUserId(options.id);
    if (
      !balance ||
      !balance[options.currency] ||
      balance[options.currency] <= options.amount
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: "Insufficient Balance"
      });
    }
    if (options.currency == "CSPR") {
      let userWallet = await readWallet({ address: options.from })
      const { privateKey, iv } = userWallet;
      const folder = path.join("./files/", "casper_keys");
      const privateKeyPath = `${folder}/${options.id}-private_key.pem`
      const publicKeyPath = `${folder}/${options.id}-public_key.pem`
      const binary = iv;
      const buffer = binary.buffer;
      const uintArray = Uint8Array.from(buffer);
      const { CSPR_WALLET_ADDRESS } = process.env;
      const decryptionProcess = await decryptDataWithPassphrase(privateKey, uintArray);
      if (decryptionProcess) {
        fs.writeFileSync(privateKeyPath, decryptionProcess, (err, data) => {
          if (err) {
            console.log("ERROR", err);
            return
          }
        })
        fs.writeFileSync(publicKeyPath, userWallet.publicKey, (err, data) => {
          if (err) {
            console.log("ERROR", err);
            return
          }
        })
        console.log(`Sent ${options.amount} crypto from balance with ID ${options.from}`);
        casperDeployHash = await sendTransfer({ to: options.address, amount: options.amount }, { publicKeyPath, privateKeyPath }, res);
      }
      const trans = await createTransaction({
        userId: options.id,
        type: "Withdrawal",
        currency: options.currency,
        to: options.address,
        amount: options.amount,
        status: "Started",
        txKey: casperDeployHash,
        from: CSPR_WALLET_ADDRESS,
        network: "CSPR"
      });

      getDeploy(CSPR_NODE_ADDRESS, casperDeployHash)
        .then(async (res) => {
          await updateTransactionById(trans._id, { status: "Completed" });
          const balance = await getBalanceByUserId(options.id)
          await updateBalance(balance._id, {
            CSPR: balance.CSPR - options.amount
          })
          let userWallets = await readAllWallets({ userId: options.id })
          const wallet = userWallets.find((wallet) => wallet.address == options.from);
          let walletAmount = wallet?.balance || 0;
          await updateWalletDoc({ _id: wallet._id }, { balance: walletAmount - options.amount })
        })
        .catch(async (err) => {
          console.log("🚀 ~ file: payment.js:80 ~ generateWithdrawal ~ err", err)
          await updateTransactionById(trans._id._id, { status: "Rejected" })
        })
      return res.status(StatusCodes.OK).json({ success: true });
    } else if (options.currency == "ETH") {
      let userWallet = await readWallet({ address: options.from })
      const binary = userWallet.iv;
      const buffer = binary.buffer;
      const uintArray = Uint8Array.from(buffer);
      const senderPrivateKey = await decryptDataWithPassphrase(userWallet.privateKey, uintArray)
      // import ethers.js
      const ethers = require('ethers')
      // network: using the Rinkeby testnet
      let network = process.env.ETHEREUM_TESTNET_PROVIDER
      // provider: Infura or Etherscan will be automatically chosen
      let provider = ethers.getDefaultProvider(network)
      // Sender private key: 
      // correspondence address 0xb985d345c4bb8121cE2d18583b2a28e98D56d04b
      let privateKey = senderPrivateKey
      // Create a wallet instance
      let wallet = new ethers.Wallet(privateKey, provider)
      // Receiver Address which receives Ether
      let receiverAddress = options.address;
      // Ether amount to send
      let amountInEther = options.amount;
      // Create a transaction object
      let tx = {
        to: receiverAddress,
        // Convert currency unit from ether to wei
        value: web3.utils.toWei(amountInEther, 'ether')
      }
      const trans = await createTransaction({
        userId: options.id,
        type: "Withdrawal",
        currency: options.currency,
        to: options.address,
        amount: options.amount,
        status: "Started",
        from: options.from,
        network: "ETH"
      });
      let i = 15;
      // Send a transaction
      wallet.sendTransaction(tx)
        .then((txObj) => {
          console.log('txHash', txObj.hash)
          if (txObj.hash) {
            let checkTransactionsStatus = new Promise(async (resolve, reject) => {
              while (i != 0) {
                const transaction1 = await web3.eth.getTransactionReceipt(txObj.hash);
                if (transaction1?.status) {
                  if (transaction1?.status) {
                    console.log("🚀 ~ file: payment.js:167 ~ checkTransactionsStatus ~ transaction1:", transaction1)
                    resolve(txObj.hash);
                    break;
                  } else {
                    reject(`Contract execution: ` + '=========> FAILLLLEEEEEEEEDDDDDD <=========');
                  }
                } else {
                  i--;
                  await sleep(5000);
                  continue;
                }
              }
              reject('Request timeout [getDeploy]')
            })

            checkTransactionsStatus.then(async (res) => {
              console.log(res)
              await updateTransactionById(trans._id, { status: "Completed", txKey: res });
              const balance = await getBalanceByUserId(options.id)
              await updateBalance(balance._id, {
                ETH: balance.ETH - options.amount
              })
              let userWallets = await readAllWallets({ userId: options.id })
              const wallet = userWallets.find((wallet) => wallet.address == options.from);
              let walletAmount = wallet?.balance || 0;
              await updateWalletDoc({ _id: wallet._id }, { balance: walletAmount - options.amount })
            })
              .catch(async (err) => {
                console.log("🚀 ~ file: transaction.js:161 ~ deployWalletTransaction ~ err", err)
                await updateTransactionById(trans._id, { status: "Withdraw Rejected" })
              });
          }
        })
      return res.status(StatusCodes.OK).json({ success: true });
    }
    const client = new Coinpayments({
      key: process.env.COINPAYMENTS_KEY,
      secret: process.env.COINPAYMENTS_SECRET
    });
    const { amount, id } = await client.createWithdrawal({
      currency: options.currency,
      amount: options.amount,
      address: options.address
    });
    await createTransaction({
      userId: options.id,
      type: "Withdrawal",
      currency: options.currency,
      to: options.address,
      amount,
      txId: id,
      status: "Started",
      network: "Eth"
    });
    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log(
      "🚀 ~ file: payment.js ~ line 75 ~ generateWithdrawal ~ err",
      err
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

module.exports = { getDepositAddress, generateWithdrawal };




