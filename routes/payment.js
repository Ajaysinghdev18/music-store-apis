const express = require("express");
const {
  getDepositAddress,
  generateWithdrawal
} = require("../controllers/payment");

const { authenticated } = require("../middlewares/auth");

const router = express.Router();

router.get("/depositAddress", authenticated, getDepositAddress);
router.post("/withdraw", authenticated, generateWithdrawal);

module.exports = router;
