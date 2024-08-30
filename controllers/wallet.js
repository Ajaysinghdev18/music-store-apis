const { StatusCodes } = require("http-status-codes");
const { getBalanceByUserId } = require("../services/balance");
const path = require('path')
const fs = require('fs');

const { readAllWallets, createWalletDoc, updateWalletDoc, readWallet } = require("../services/wallet");
const { decryptDataWithPassphrase, encryptDataWithPassphrase } = require("../utils/helpers");
const { STATUS_CODES } = require("http");
const ethers = require('ethers');
const crypto = require('crypto');
const { createAccountKeys } = require("../utils/cspr");
const { readUser } = require("../services/user");

const readWalletsByUser = async (req, res) => {
  try {
    let { query } = req.query;

    let newQuery = {};
    let user;
    if (query) {
      query = JSON.parse(query);
      Object.entries(query).map(([key, value]) => {
        newQuery[key] = value;
      });
      if (query?.artistId) {
        console.log("🚀 ~ file: wallet.js:26 ~ readWalletsByUser ~ query?.artistId:", query?.artistId)
        user = await readUser({ artistId: query?.artistId });
        newQuery.userId = user?._id;
      }
    } else {
      newQuery = {
        userId: req.user.id
      }
    }
    console.log("🚀 ~ file: wallet.js:36 ~ readWalletsByUser ~ newQuery:", newQuery)
    const wallets = await readAllWallets(newQuery).select('-iv');
    res.status(StatusCodes.OK).json({ success: true, wallets });
  } catch (err) {
    console.log("🚀 ~ file: wallet.js:10 ~ readWalletsByUser ~ err:", err)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


const readWalletById = async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await readWallet({ _id: id }).populate({
      path: 'nfts',
      populate: {
        path: 'productId',
        model: 'Product'
      }
    })
    res.status(StatusCodes.OK).json({ success: true, wallet });
  } catch (err) {
    console.log("🚀 ~ file: wallet.js:10 ~ readWalletsByUser ~ err:", err)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const downloadPrivateKey = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, error: "Invalid params!" });
    }
    const wallet = await readWallet({ _id: id })
    let folder;
    let filePath;
    if (wallet.chain == 'CSPR') {
      folder = path.join("./files/", "casper_keys");
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      filePath = `${folder}/${wallet.name}.pem`;
    } else {
      folder = path.join("./files/", "eth_keys");
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      filePath = `${folder}/${wallet.name}.txt`;
    }
    const binary = wallet.iv;
    const buffer = binary.buffer;
    const uintArray = Uint8Array.from(buffer);
    const privateKey = await decryptDataWithPassphrase(wallet.privateKey, uintArray)

    // Replace with the path to your file
    fs.writeFileSync(filePath, privateKey, (err, data) => {
      if (err) {
        console.log("ERROR", err);
        return
      }
    })
    res.download(filePath, wallet.name, (err) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error downloading file.');
      }
    });
  } catch (err) {
    console.log("🚀 ~ file: wallet.js:10 ~ readWalletsByUser ~ err:", err)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};


const updateWalletById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, error: "Invalid params!" });
    }
    const wallet = await readWallet({ _id: id });
    if (!wallet) {
      return res.status(404)
        .json({ success: false, msg: 'Not found!' });
    }
    await updateWalletDoc({ _id: id }, req.body);
    res.status(StatusCodes.OK).json({ success: true, });
  } catch (err) {
    console.log("🚀 ~ file: wallet.js:10 ~ readWalletsByUser ~ err:", err)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};



const createWallet = async (req, res) => {
  try {
    const { name, chain } = req.body;
    let newWallet;
    if (!name || !chain) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, error: 'Invalid argumetns' })
    }

    const user = req.user;
    if (chain == 'CSPR') {
      const keys = createAccountKeys();
      const privateKeyData = fs.readFileSync(keys.privateKeyPath, 'utf8').toString();
      const publicKeyData = fs.readFileSync(keys.publicKeyPath, 'utf8').toString();

      encryptDataWithPassphrase(privateKeyData, async (data) => {
        newWallet = await createWalletDoc({
          isConnected: false,
          default: false,
          privateKey: data.encrypted,
          address: keys.accountAddress,
          publicKey: publicKeyData,
          chain: chain,
          userId: user.id,
          name: name,
          iv: data.iv
        })
        res.status(StatusCodes.CREATED).json({ success: true, newWallet });
      })

    }
    if (chain == 'ETH') {
      let id = crypto.randomBytes(32).toString('hex');
      let ethPrivateKey = "0x" + id;
      encryptDataWithPassphrase(ethPrivateKey, async (data) => {
        let wallet = new ethers.Wallet(ethPrivateKey);
        newWallet = await createWalletDoc({
          isConnected: false,
          default: false,
          privateKey: data.encrypted,
          address: wallet.address,
          chain: chain,
          userId: user.id,
          name: name,
          iv: data.iv
        })
        res.status(StatusCodes.CREATED).json({ success: true, newWallet });
      }
      )
    }

  } catch (err) {
    console.log("🚀 ~ file: cart.js ~ line 46 ~ addToCart ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const updateWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await updateWalletDoc({ _id: id }, req.body);
    res.status(StatusCodes.OK).json({ success: true, wallet });
  } catch (err) {
    console.log("🚀 ~ file: cart.js ~ line 46 ~ addToCart ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

module.exports = { readWalletsByUser, createWallet, updateWallet, readWalletById, updateWalletById, downloadPrivateKey };
