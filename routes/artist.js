const express = require("express");
const path = require("path");
const multer = require("multer");

const {
    create,
    read,
    readAll,
    update,
    remove,
    getVerificationArtistByID,
    readbyName,
    searchArtist
} = require("../controllers/artist");

const { authenticated, isAdmin } = require("../middlewares/auth");

const storage = multer.diskStorage({
    destination: "./files/thumbnail",
    filename: function(req, file, cb) {
        cb(null, "artist-" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const router = express.Router();

router.post("/", authenticated, isAdmin, upload.single("thumbnail"), create);
router.get("/", readAll);
router.get("/verify/:id", getVerificationArtistByID)
router.get("/artist/:name", readbyName);
router.get("/search/:value", searchArtist);
router
    .route("/:id")
    .get(read)
    .delete(remove)
    .patch(authenticated, isAdmin, upload.single("thumbnail"), update);

module.exports = router;
