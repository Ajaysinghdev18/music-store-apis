const express = require("express");
const { updateTransaction } = require("../controllers/ipn");
const { createCheckoutSession, chargeSucceeded } = require("../controllers/stripe");
const { authenticated } = require("../middlewares/auth");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();

app.use(bodyParser.raw({ type: "*/*" }))
router.post("/charge", express.raw({ type: 'application/json' }), chargeSucceeded);

module.exports = router;
