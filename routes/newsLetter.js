const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const { authenticated } = require("../middlewares/auth");
const { createNewsLetter,uploadImagetoBucket, sendNewsLetterToUser, getNewsLetterByID, getAllNewsLetter, updateNewLeter, deleteNewsLetter} = require('../controllers/newLetterTemplate')

const storage = multer.diskStorage({
    destination: "./files/thumbnail",
    filename: function (req, file, cb) {
      cb(null, "gallery-" + Date.now() + path.extname(file.originalname));
    }
  });


const upload = multer({ storage });
router.post("/send", sendNewsLetterToUser);
router.post("/",  authenticated, upload.single("thumbnail"), createNewsLetter);
router.post("/upload",authenticated, upload.single("image"), uploadImagetoBucket );
router.get("/", getAllNewsLetter, authenticated );
router.route("/:id").
    get(getNewsLetterByID, authenticated)
    .delete(authenticated, deleteNewsLetter)
    .patch(authenticated, upload.single("thumbnail"), updateNewLeter)
module.exports = router;