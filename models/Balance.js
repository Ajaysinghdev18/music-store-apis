const mongoose = require("mongoose");

const BalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  BTC: {
    type: Number,
    required: false
  },
  ETH: {
    type: Number,
    required: false
  },
  USDT: {
    type: Number,
    required: false
  },
  USDC: {
    type: Number,
    required: false
  },
  LTCT: {
    type: Number,
    required: false
  },
  CSPR: {
    type: Number,
  }
});

module.exports = mongoose.model("Balance", BalanceSchema);
