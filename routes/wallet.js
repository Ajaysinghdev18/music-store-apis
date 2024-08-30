const express = require("express");
const { readWalletsByUser, createWallet, readWalletById, updateWalletById, downloadPrivateKey } = require("../controllers/wallet");
const { authenticated } = require("../middlewares/auth");

const router = express.Router();

router.get("/", authenticated, readWalletsByUser);
router.post("/create", authenticated, createWallet);
router.patch("/edit/:id", authenticated, updateWalletById);
router.get("/:id", authenticated, readWalletById);
router.post("/:id", authenticated, downloadPrivateKey);

module.exports = router;
