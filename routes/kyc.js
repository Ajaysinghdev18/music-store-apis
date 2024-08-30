const express = require("express");
const { getAccessToken, getApplicationStatus, createKYCRecord, getAllKYCRecord, getKYCById, updateKYCById } = require("../controllers/kyc");
const router = express.Router();
const { authenticated } = require("../middlewares/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let id = req.user._id !== undefined ? req.user._id : Date.now();
    // setting destination of uploading files
    const dir = "./files/kyc/" + id;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    let id = req.user._id !== undefined ? req.user._id : Date.now();
    cb(null, file.fieldname + "-" + id + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
router.get("/accessToken", getAccessToken);
router.get("/applicationStatus", authenticated, getApplicationStatus);

//KYC
router.post(
  "/",
  authenticated,
  upload.fields([
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
    { name: "faceId", maxCount: 1 }
  ]),
  createKYCRecord
);
router.get(
  "/",
  authenticated,
  getAllKYCRecord
);
router
  .route("/:id")
  .get(getKYCById)
  .patch(
    authenticated,
    upload.fields([
      { name: "idFront", maxCount: 1 },
      { name: "idBack", maxCount: 1 },
      { name: "faceId", maxCount: 1 }
    ]),
    updateKYCById
  );

module.exports = router;
