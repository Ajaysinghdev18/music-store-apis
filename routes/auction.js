const express = require("express");
const { readAll, update, createBidOnAuction, finishAuction } = require("../controllers/auction");

const { authenticated, isAdmin } = require("../middlewares/auth");

const router = express.Router();

router.get("/", authenticated, readAll);
router.patch("/:id", authenticated, update);
router.post("/bid/:id", authenticated, createBidOnAuction);
router.post("/status/:id", authenticated, isAdmin, finishAuction);

module.exports = router;
