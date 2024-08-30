const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const { authenticated, isAdmin } = require("../middlewares/auth");
const { sendEmailToUser, uploadImagetoBucket, createTemplate, getAllEmailTemplate, deleteTemplate, getAllEmailTemplateById, updateTemplate } = require("../controllers/email");

const storage = multer.diskStorage({
    destination: "./files/thumbnail",
    filename: function (req, file, cb) {
      cb(null, "gallery-" + Date.now() + path.extname(file.originalname));
    }
  });


const upload = multer({ storage });
router.post("/send", sendEmailToUser);
router.post("/",  authenticated, isAdmin, upload.single("thumbnail"), createTemplate);
router.get("/", getAllEmailTemplate, authenticated, isAdmin );
router.post("/upload",authenticated, isAdmin, upload.single("image"), uploadImagetoBucket );
router.route("/:id").
    get(getAllEmailTemplateById, authenticated, isAdmin)
    .delete(authenticated, isAdmin, deleteTemplate)
    .patch(authenticated, isAdmin, upload.single("thumbnail"), updateTemplate)
module.exports = router;