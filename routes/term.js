const express = require("express");

const { authenticated, isAdmin } = require("../middlewares/auth");

const { create, read, update } = require("../controllers/term");

const router = express.Router();

router.post("/", authenticated, isAdmin, create);
router.get("/", read);
router.patch("/",authenticated, isAdmin, update)

module.exports = router;
