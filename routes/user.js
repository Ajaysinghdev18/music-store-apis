const path = require("path");
const multer = require("multer");
const express = require("express");

const { authenticated, isAdmin } = require("../middlewares/auth");
const {
  create,
  read,
  readAll,
  remove,
  resetPassword,
  getFavorites,
  update,
  updatePassword,
  changePasswordByAdmin,
  updateAvatar,
  getMessages,
  removeMessage,
  updateMessage,
  subscribeArtistToggle,
  getSubscribedArtist,
  getShopHistory,
  toggleKYCVerified
} = require("../controllers/user");

const router = express.Router();
const storage = multer.diskStorage({
  destination: "./files/avatar",
  filename: function(req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + req.user.id + path.extname(file.originalname)
    );
  }
});

const upload = multer({ storage });

router.get("/favorites", authenticated, getFavorites);
router.post("/subsricbe-toggle", authenticated, subscribeArtistToggle);
router.get("/:id/favorites/", authenticated, getFavorites);
router.get("/:id/subscribed/", authenticated, getSubscribedArtist);
router.get("/subscribed/", authenticated, getSubscribedArtist);
router.get("/", authenticated, isAdmin, readAll);
router.post("/",authenticated, isAdmin, create)
router.get("/messages", authenticated, getMessages);
router.route("/messages/:id").delete(authenticated, removeMessage);
router.route("/messages/:id").patch(authenticated, updateMessage);
router
  .route("/:id")
  .get(authenticated, isAdmin, read)
  .patch(authenticated, update)
  .delete(authenticated, isAdmin, remove);
router
  .route("/:id/reset-password")
  .patch(authenticated, isAdmin, resetPassword);
router.route("/:id/update-password").patch(authenticated, updatePassword);
router.route("/:id/change-password").patch(authenticated, isAdmin,changePasswordByAdmin);
router.post(
  "/:id/update-avatar",
  authenticated,
  upload.single("avatar"),
  updateAvatar
);
router.get("/:id/shop-history", authenticated, getShopHistory);
router.post("/toggle-kyc/:id", authenticated, toggleKYCVerified);

module.exports = router;
