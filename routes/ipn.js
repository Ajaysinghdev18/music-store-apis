const express = require("express");
const { updateTransaction } = require("../controllers/ipn");

const router = express.Router();

router.post("/", updateTransaction);

module.exports = router;
