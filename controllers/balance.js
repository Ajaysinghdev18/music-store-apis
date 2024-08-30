const { StatusCodes } = require("http-status-codes");
const {
  getBalanceByUserId,
  createBalanceForUser
} = require("../services/balance");
const { getBalanceWithConversionRate } = require("../utils/balance");
const { CasperServiceByJsonRPC, CLPublicKey } = require("casper-js-sdk");
const { default: axios } = require("axios");
const { getCsprAccountBalance } = require("../utils/cspr");

const cryptos = ["BTC", "ETH", "CSPR", "LTCT"];

const getBalance = async (req, res) => {
  try {
    let { options } = req.query;
    if (options) {
      options = JSON.parse(options);
    }
    const balance = await getBalanceByUserId(options.id);
    if (balance) {
      const userBalance = await getBalanceWithConversionRate(balance, cryptos);
      res.status(StatusCodes.OK).json({ success: true, balance: userBalance });
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, msg: "Not Found" });
    }
  } catch (err) {
    console.log("🚀 ~ file: balance.js ~ line 22 ~ getBalance ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const getCasperAccountInformation = async (req, res) => {
  try {
    const { publicKey } = req.params;
    const balance = await getCsprAccountBalance(publicKey)
    return res.status(StatusCodes.OK).json({
      success: true,
      balance: balance.toString()
    });
  } catch (err) {
    console.log("🚀 ~ file: balance.js ~ line 46 ~ getBalance ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

const createBalance = async (req, res) => {
  try {
    let { options } = req.body;
    const balance = await createBalanceForUser(options.id);
    if (balance) {
      return res
        .status(StatusCodes.OK)
        .json({ success: true, balance: balance });
    }
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: "Error while creating Balance for User"
    });
  } catch (err) {
    console.log("🚀 ~ file: balance.js ~ line 46 ~ getBalance ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

module.exports = { getBalance, createBalance, getCasperAccountInformation };
