const express = require("express");
const { readAllServices, create, remove } = require("../controllers/service");
const { authenticated, isAdmin, } = require("../middlewares/auth");

const router = express.Router();

router.get("/", authenticated, isAdmin, readAllServices);
router.post("/", authenticated, isAdmin, create);
router.delete("/:id", authenticated, isAdmin, remove);


module.exports = router;
