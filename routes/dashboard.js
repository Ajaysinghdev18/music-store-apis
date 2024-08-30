const express = require("express");

const { getDashData } = require("../controllers/dashboard");

const router = express.Router();

router.get("/", getDashData);

module.exports = router;
