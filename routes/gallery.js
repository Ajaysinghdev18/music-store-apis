const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  createGallery,
  getAllGalleriesByArtist,
  getGalleryById,
  getGalleryByName,
  addIpfs,
  getAllNftsByGalleryId,
  update,
  mintNftInGallery,
  all,
  remove,
  searchGallery
} = require("../controllers/gallery");
const { isAdmin, authenticated } = require("../middlewares/auth");

const router = express.Router();
const storage = multer.diskStorage({
  destination: "./files/thumbnail",
  filename: function (req, file, cb) {
    cb(null, "gallery-" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post("/", authenticated, isAdmin, upload.single("thumbnail"), createGallery);
router.get("/all", all);
router.route("/:id")
  .get(getAllGalleriesByArtist)
  .delete(remove)
router.post("/mint", upload.single("uri"), mintNftInGallery);
router.get("/nfts/:id", getAllNftsByGalleryId);
router.get("/name/:name", getGalleryByName);
router.get("/search/:value", searchGallery);
router.route("/detail/:id").get(getGalleryById);
router.patch("/:id/add", addIpfs);
router.patch("/:id", upload.single("thumbnail"), update);

module.exports = router;
