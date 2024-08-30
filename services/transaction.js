const Transaction = require("../models/Transaction");

const createTransaction = object => {
  return Transaction.create(object);
};

const getAllTransactions = (query = {}, projection = null, options = {}) => {
  return Transaction.find(query, projection, options);
};

const getTransaction = object => {
  return Transaction.findOne(object);
};

const deleteTransactionById = id => {
  return Transaction.findByIdAndDelete({ _id: id });
};

const updateTransactionById = (transactionId, transactionData) => {
  return Transaction.findByIdAndUpdate(transactionId, transactionData, {
    new: true
  });
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransaction,
  deleteTransactionById,
  updateTransactionById
};
