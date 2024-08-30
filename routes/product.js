const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductByName,
  searchProducts,
  deleteProductById,
  updateProductById,
  toggleFeaturedProduct,
  toggleFavouriteProduct,
  getTokenTransactionDetails,
  transferTokenToAddress,
  getProductByArtistID,
  getObjectDataFromResource,
  isProductPublic,
  toggleAuctionedProduct
} = require("../controllers/product");
const { authenticated, isAdmin } = require("../middlewares/auth");
const { generatePrevieweOfVideo } = require("../utils/ffmpeg");
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // setting destination of uploading files
    const dir = "./files/" + file.fieldname;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (file.fieldname === "thumbnail") {
      // if uploading thumbnail
      cb(null, dir);
    } else if (file.fieldname === "icon") {
      // if uploading icon
      cb(null, dir);
    } else if (file.fieldname === "video") {
      // if uploading video
      cb(null, dir);
    }
    else if (file.fieldname === "image") {
      // if uploading video
      cb(null, dir);
    }
    else if (file.fieldname === "sign") {
      // if uploading sign
      cb(null, dir);
    } else if (file.fieldname === "music") {
      // if uploading music
      cb(null, dir);
    } else if (file.fieldname === "preview") {
      // if uploading preview
      cb(null, dir);
    } else if (file.fieldname === "mask_thumbnail") {
      cb(null, dir);
    } else if (file.fieldname === 'object') {
      cb(null, dir)
    }
  },
  filename: function (req, file, cb) {
    let id = req.body._id !== undefined ? req.body._id : Date.now();
    cb(null, file.fieldname + "-" + id + path.extname(file.originalname));
  }
});
const router = express.Router();

const upload = multer({ storage });

router.post(
  "/",
  authenticated,
  isAdmin,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "mask_thumbnail", maxCount: 1 },
    { name: "icon", maxCount: 1 },
    { name: "sign", maxCount: 1 },
    { name: "music", maxCount: 1 },
    { name: "preview", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "object", maxCount: 1 }

  ]),
  createProduct
);
router.get("/", getAllProducts);
router.get("/nft/:txHash", getTokenTransactionDetails);
router.post("/nft/transfer/:to", transferTokenToAddress);

// This route made conflict with getProductById so i commented.
// router.route("/:productName").get(getProductByName);
router.route("/product/:name").get(getProductByName)
router.route("/artist/:id").get(getProductByArtistID)
router.route("/isPublic/:id").get(isProductPublic)
router
  .route("/:id")
  .get(getProductById)
  .delete(authenticated, isAdmin, deleteProductById)
  .patch(
    authenticated,
    isAdmin,
    upload.fields([
      { name: "thumbnail", maxCount: 1 },
      { name: "mask_thumbnail", maxCount: 1 },
      { name: "icon", maxCount: 1 },
      { name: "sign", maxCount: 1 },
      { name: "music", maxCount: 1 },
      { name: "preview", maxCount: 1 },
      { name: "video", maxCount: 1 },
      { name: "image", maxCount: 1 }
    ]),
    updateProductById
  );
router.post("/toggle-favorite", toggleFavouriteProduct);
router.post("/toggle-feature", authenticated, isAdmin, toggleFeaturedProduct);
router.post("/toggle-auction", authenticated, isAdmin, toggleAuctionedProduct);
router.get("/3d-object/:id", getObjectDataFromResource)
router.get("/search/:value", searchProducts);

module.exports = router;
