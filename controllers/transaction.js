const { StatusCodes } = require("http-status-codes");
const {
  storeTransaction,
  confirmTransaction,
  deleteTransaction
} = require("../utils/taxamo");
const { getAllTransactions, createTransaction, updateTransactionById, getTransaction } = require("../services/transaction");
const { CasperServiceByJsonRPC, DeployUtil, CasperClient } = require("casper-js-sdk");
const { config } = require("dotenv");
config({ path: ".env" });
const client = new CasperServiceByJsonRPC(process.env.CSPR_NODE_ADDRESS);

const axios = require("axios");
const { updateBalance, getBalanceByUserId } = require("../services/balance");
const { sleep } = require("../utils/cspr");
const Web3 = require('web3');
const { updateWalletDoc, readWallet } = require("../services/wallet");


const getTransactions = async (req, res) => {
  try {
    let { query, projection, options } = req.query;
    console.log("🚀 ~ file: transaction.js:23 ~ getTransactions ~ query:", query)

    if (query) {
      query = JSON.parse(query);
    }

    if (projection) {
      projection = JSON.parse(projection);
    }

    if (options) {
      options = {
        sort: { createdAt: -1 },
        ...JSON.parse(options)
      };
    }
    const transactions = await getAllTransactions(query, projection, options);

    let all = await getAllTransactions(query);

    let pageLimit;
    let pageNumber;
    if (options) {
      if (options.limit) {
        pageLimit = options.limit;

        if (options.skip) {
          pageNumber = options.skip / options.limit;
        }
      }
    }

    const pagination = {
      total: all.length,
      pageLimit,
      pageNumber
    };

    res
      .status(StatusCodes.OK)
      .json({ success: true, transactions: transactions, pagination });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const creditTransaction = async (req, res) => {
  try {
    const {
      custom_id,
      amount,
      buyer_ip,
      currency_code,
      billing_country_code,
      buyer_credit_card_prefix
    } = req.body;
    const { transaction } = await storeTransaction({
      custom_id,
      amount,
      buyer_ip,
      currency_code,
      billing_country_code,
      buyer_credit_card_prefix
    });
    if (transaction.key) {
      const res = await confirmTransaction(transaction.key);
      return res
        .status(StatusCodes.OK)
        .json({ success: true, data: res.transaction });
    }
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, msg: "Something went wrong" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const cancelTransaction = async (req, res) => {
  try {

    const { transaction_key } = req.body;
    const { transaction } = await deleteTransaction(transaction_key);
    res.status(StatusCodes.OK).json({ success: true, transaction });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};

const deployWalletTransaction = async (req, res) => {
  try {
    const { value, amount, from, to, coin, tx } = req.body;
    const { id } = req.user;
    let transactionHash = ''
    if (coin == 'CSPR') {
      if (!value) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false });
      }
      let signedDeploy = DeployUtil.deployFromJson(value).unwrap();
      let { deploy_hash } = await client.deploy(signedDeploy);
      transactionHash = deploy_hash;
      let transaction = {
        userId: id,
        currency: "CSPR",
        type: "Deposit",
        amount,
        status: "Started",
        txKey: deploy_hash,
        to,
        from,
        network: "CSPR"
      }
      const trans = await createTransaction(transaction);
      const casperClient = new CasperClient(process.env.CSPR_NODE_ADDRESS);
      let i = 12;

      let checkTransactionsStatus = new Promise(async (resolve, reject) => {
        while (i != 0) {
          const [deploy, raw] = await casperClient.getDeploy(deploy_hash);
          if (raw.execution_results.length !== 0) {
            if (raw.execution_results[0].result.Success) {
              resolve(deploy, raw.execution_results[0].result);
              break;
            } else {
              reject(`Contract execution: ` + raw.execution_results[0].result.Failure.error_message);
            }
          } else {
            i--;
            await sleep(6000);
            continue;
          }
        }
        reject('Request timeout [getDeploy]')
      })
      checkTransactionsStatus.then(async (res) => {
        await updateTransactionById(trans._id, { status: "Deposit Confirmed" });
        const balance = await getBalanceByUserId(id)
        await updateBalance(balance._id, {
          CSPR: balance.CSPR ? (balance.CSPR + amount) : amount
        })
        const wallet = await readWallet({ address: to })
        let walletAmount = wallet?.balance || 0;
        await updateWalletDoc({ _id: wallet._id }, { balance: walletAmount + amount })
      })
        .catch(async (err) => {
          console.log("🚀 ~ file: transaction.js:161 ~ deployWalletTransaction ~ err", err)
          await updateTransactionById(trans._id._id, { status: "Deposit Rejected" })
        });
    } else if (coin == 'ETH') {
      if (!tx) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false });
      }
      const web3 = new Web3(process.env.ETHEREUM_TESTNET_PROVIDER);
      let transaction = {
        userId: id,
        currency: "ETH",
        type: "Deposit",
        amount,
        status: "Started",
        txKey: tx,
        from,
        to,
        network: "ETH"
      }
      transactionHash = tx;
      const trans = await createTransaction(transaction);
      let i = 15;
      let checkTransactionsStatus = new Promise(async (resolve, reject) => {
        while (i != 0) {
          const transaction1 = await web3.eth.getTransactionReceipt(tx);
          if (transaction1?.status) {
            if (transaction1?.status) {
              resolve('=========> Transaction Succeded <=========');
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
        await updateTransactionById(trans._id, { status: "Deposit Confirmed" });
        const balance = await getBalanceByUserId(id)
        await updateBalance(balance._id, {
          ETH: balance.ETH ? balance.ETH + amount : amount
        });
        const wallet = await readWallet({ address: to })
        let walletAmount = wallet?.balance || 0;
        await updateWalletDoc({ _id: wallet._id }, { balance: walletAmount + amount })
      })
        .catch(async (err) => {
          console.log("🚀 ~ file: transaction.js:161 ~ deployWalletTransaction ~ err", err)
          await updateTransactionById(trans._id._id, { status: "Deposit Rejected" })
        });
    }

    res.status(StatusCodes.OK).json({ success: true, deployHash: transactionHash });
  } catch (error) {
    console.log(
      "🚀 ~ file: transaction.js ~ line 83 ~ createTransaction ~ error",
      error
    );
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: error.message });
  }
};





module.exports = { getTransactions, creditTransaction, cancelTransaction, deployWalletTransaction };
