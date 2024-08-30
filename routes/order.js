const express = require("express");
const {
  createOrder,
  getAllOrders,
  updateOrder,
  getOrderById,
  getVat,
  updateOrderStatus,
  getNfts,
  createCheckoutSession
} = require("../controllers/order");
const { isAdmin, authenticated } = require("../middlewares/auth");

const router = express.Router();

router.post("/orders", createOrder);
router.post("/stripe-session", authenticated, createCheckoutSession);
router.get("/orders", authenticated, getAllOrders);
router.patch("/orders/status", authenticated, updateOrderStatus);
router.patch("/orders/:id", authenticated, updateOrder);
router.get("/orders/:id", authenticated, getOrderById);
router.get("/vat", getVat);
router.get("/purchase/nfts", authenticated, getNfts);

module.exports = router;
