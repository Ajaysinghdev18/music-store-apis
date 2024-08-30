const express = require("express");
const {
  addToCart,
  removeFromCart,
  addDiscountToCart,
  getCartDetails
} = require("../controllers/cart");


const router = express.Router();

router.post("/add", addToCart);
router.delete("/remove", removeFromCart);
router.get("/", getCartDetails);
router.post("/discount", addDiscountToCart)
module.exports = router;
