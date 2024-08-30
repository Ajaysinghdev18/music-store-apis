const express = require("express");

const { authenticated, isAdmin } = require("../middlewares/auth");

const { create, readAll, remove, update } = require("../controllers/us");

const router = express.Router();

router.post("/", create);
router.get("/", readAll);
router
  .route("/:id")
  .patch(authenticated, isAdmin, update)
  .delete(authenticated, isAdmin, remove);

module.exports = router;
