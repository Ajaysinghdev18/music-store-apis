const express = require("express");
const path = require("path");
const multer = require("multer");
const { authenticated, isAdmin } = require("../middlewares/auth");

const {
  create,
  getAllSocialByArtist,
  getSocialById,
  deleteSocialById,
  updateSocial
} = require("../controllers/social");

const storage = multer.diskStorage({
  destination: "./files/social",
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
const upload = multer({ storage });

const router = express.Router();

router.post("/", upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "attachment", maxCount: 1 },
]), create);
router.get("/artist/:id", getAllSocialByArtist);
router.route("/:id").get(getSocialById)
.delete(authenticated, isAdmin, deleteSocialById)
.patch( upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "attachment", maxCount: 1 },
]), updateSocial)
,


module.exports = router;
