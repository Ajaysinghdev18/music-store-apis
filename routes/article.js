const express = require("express");
const path = require("path");
const multer = require("multer");

const {
  create,
  read,
  readAll,
  remove,
  update,
  toggleFeatured
} = require("../controllers/article");

const { authenticated, isAdmin } = require("../middlewares/auth");

const storage = multer.diskStorage({
  destination: "./files/thumbnail",
  filename: function(req, file, cb) {
    cb(null, "article-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const router = express.Router();

router.post("/toggle-feature", authenticated, isAdmin, toggleFeatured);
router.post("/", authenticated, isAdmin, upload.single("thumbnail"), create);
router.get("/", readAll);
router
  .route("/:id")
  .get(read)
  .delete(authenticated, isAdmin, remove)
  .patch(authenticated, isAdmin, upload.single("thumbnail"), update);

module.exports = router;
