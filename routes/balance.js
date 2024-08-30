const express = require("express");
const {
  getBalance,
  createBalance,
  getCasperAccountInformation
} = require("../controllers/balance");

const { authenticated, isAdmin } = require("../middlewares/auth");

const router = express.Router();

router.get("/", authenticated, getBalance);
router.post("/", authenticated, createBalance);
router.get("/casper/:publicKey", authenticated, getCasperAccountInformation);

module.exports = router;
