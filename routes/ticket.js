const express = require("express");
const path = require("path");
const multer = require("multer");

const {
  create,
  read,
  readAll,
  remove,
  update,
  favoriteTickets,
  archieveTickets,
  deleteTickets
} = require("../controllers/ticket");
const { authenticated, isAdmin } = require("../middlewares/auth");

const storage = multer.diskStorage({
  destination: "./files",
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
const upload = multer({ storage });

const router = express.Router();

router.post("/", upload.array("files", 10), create);
router.post("/favorite", authenticated, favoriteTickets);
router.post("/archieve", authenticated, archieveTickets);
router.delete("/delete", authenticated, deleteTickets);
router.get("/", readAll);
router
  .route("/:id")
  .get(read)
  .delete(authenticated, isAdmin, remove)
  .patch(authenticated, upload.array("files", 10), update);

module.exports = router;
