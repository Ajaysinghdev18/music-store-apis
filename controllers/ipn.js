const querystring = require("querystring");
const { StatusCodes } = require("http-status-codes");
const {
  updateTransactionById,
  getTransaction
} = require("../services/transaction");
const { updateBalance, getBalanceByUserId } = require("../services/balance");

const updateTransaction = async (req, res) => {
  try {
    let parsedData = req.body;
    if (parsedData.ipn_type === "deposit") {
      const txn = await getTransaction({ address: parsedData.address });
      if (txn && txn.status !== "Deposit confirmed") {
        await updateTransactionById(
          { _id: txn._id },
          {
            amount: parsedData.amount,
            status: parsedData.status_text,
            txId: parsedData.id,
            txKey: parsedData.txn_id
          }
        );
        if (parsedData.status_text === "Deposit confirmed") {
          const balance = await getBalanceByUserId(txn.userId);
          const updatedBalance = balance[txn.currency]
            ? balance[txn.currency] + +parseFloat(parsedData.amount).toFixed(8)
            : parseFloat(parsedData.amount).toFixed(8);
          await updateBalance(
            {
              _id: balance._id
            },
            {
              [txn.currency]: updatedBalance
            }
          );
        }
      }
    } else if (parsedData.ipn_type === "withdrawal") {
      const txn = await getTransaction({ txId: parsedData.id });
      if (txn && txn.status !== "Complete") {
        await updateTransactionById(
          { _id: txn._id },
          {
            status: parsedData.status_text,
            txKey: parsedData.txn_id
          }
        );
        if (parsedData.status_text === "Complete") {
          const balance = await getBalanceByUserId(txn.userId);
          const updatedBalance =
            balance[txn.currency] - +parseFloat(parsedData.amount).toFixed(8);
          await updateBalance(
            {
              _id: balance._id
            },
            { [txn.currency]: updatedBalance }
          );
        }
      }
    }
    res.status(StatusCodes.OK).json({ success: true });
  } catch (err) {
    console.log("🚀 ~ file: ipn.js ~ line 71 ~ updateTransaction ~ err", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, error: err.message });
  }
};

module.exports = { updateTransaction };
