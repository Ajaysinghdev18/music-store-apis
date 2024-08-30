const express = require("express");
const {
  getTransactions,
  creditTransaction,
  cancelTransaction,
  deployWalletTransaction
} = require("../controllers/transaction");
const { authenticated } = require("../middlewares/auth");

const router = express.Router();

router.get("/", authenticated, getTransactions);
router.post("/credit", authenticated, creditTransaction);
router.post("/cancel", authenticated, cancelTransaction);
router.post("/deploy", authenticated, deployWalletTransaction);


module.exports = router;
