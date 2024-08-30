const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const { authenticated, isAdmin } = require("../middlewares/auth");
const {
    createTemplate,
    getCMSTemplateById,
    getAllCMSTemplate,
    deleteTemplate,
    updateTemplate,
    getAllTemplate,
    createDemoTemplate
 } = require('../controllers/cms')

const storage = multer.diskStorage({
    destination: "./files/thumbnail",
    filename: function (req, file, cb) {
      cb(null, "gallery-" + Date.now() + path.extname(file.originalname));
    }
  });


const upload = multer({ storage });
router.post("/",  authenticated, isAdmin, upload.single("thumbnail"), createTemplate);
router.post("/demo",  authenticated, isAdmin, upload.single("thumbnail"), createDemoTemplate);
router.get("/", getAllCMSTemplate, authenticated );
router.get("/demo", getAllTemplate, authenticated, isAdmin );
router.route("/:id").
    get(getCMSTemplateById, authenticated, isAdmin)
    .delete(authenticated, isAdmin, deleteTemplate)
    .patch(authenticated, isAdmin, upload.single("thumbnail"), updateTemplate)
module.exports = router;