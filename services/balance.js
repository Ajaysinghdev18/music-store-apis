const Balance = require("../models/Balance");

const createBalanceForUser = async userId => {
  let balance = await Balance.findOne({ userId });
  if (!balance) {
    balance = await Balance.create({
      userId
    });
  }
  return balance;
};

const updateBalance = (balanceId, balanceData) => {
  return Balance.findByIdAndUpdate(balanceId, balanceData, {
    new: true
  });
};

const getBalanceByUserId = id => {
  return Balance.findOne({ userId: id });
};

module.exports = {
  createBalanceForUser,
  updateBalance,
  getBalanceByUserId
};
