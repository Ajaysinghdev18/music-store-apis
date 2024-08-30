const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  fingerprint: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "User"
  },
  discount: {
    type: Number,
    default: 0
  },
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon"
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product"
      },
      price: Number,
      currency: {
        type: String,
        required: true,
      },
      isAuction: {
        type: Boolean,
        default: false
      },
      timeToBuy: {
        type: Number
      },
      features: {
        type: Array
      },
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("cart", CartSchema);
