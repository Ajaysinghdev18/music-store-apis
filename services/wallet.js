const Wallet = require("../models/Wallet");



const readAllWallets = (condition) => {
  return Wallet.find(condition)
};

const readWallet = (condition) => {
  return Wallet.findOne(condition)
};


const createWalletDoc = (object) => {
  return Wallet.create(object)
};

const updateWalletDoc = (condition, object) =>
  Wallet.findOneAndUpdate(condition, { $set: object }, { new: true });

module.exports = { readAllWallets, createWalletDoc, updateWalletDoc, readWallet };
