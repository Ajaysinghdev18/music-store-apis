const express = require("express");

const { invoiceInfo } = require("../controllers/taxamo");

const router = express.Router();

router.put("/invoice-info", invoiceInfo);

module.exports = router;
