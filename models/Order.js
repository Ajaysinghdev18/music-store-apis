const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productName: {
    type: String
  },
  price: {
    type: Number,
    required: [true, "Please add a product price"]
  },
  type: {
    type: String,
    required: [true, "Product Type is required"]
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  thumbnail: {
    type: Object,
    required: [true, "Thumbnail is required"]
  },
  features: {
    type: Array
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }
});

const OrderSchema = new mongoose.Schema(
  {
    orderItems: [orderItemSchema],
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    phoneNumber: String,
    casperWalletKey: { type: String, default: "" },
    ethereumWalletKey: { type: String, default: "" },
    email: String,
    note: String,
    isGift: Boolean,
    totalPrice: {
      type: Number,
      required: [true, "Please add a total price"]
    },
    status: {
      type: String,
      enum: ["Created", "Processed", "Failed", "Cancelled"],
      default: "Created"
    },
    paidAt: {
      type: Date
    },
    paymentMethod: String,
    txKey: String,
    clientReferenceId: {
      type: String,
    },
    stripePaymentId: {
      type: String,
    },
    taxamoId: {
      type: String,
    },
    taxamoInvoiceNumber: {
      type: String,
    },
    discount: {
      type: Number
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    nfts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'nft'
    },
    vat: {
      type: Number,
      default: 0
    },
    invoiceAddress: {
      type: Object
    },
    transaction_lines: {
      type: Array
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", OrderSchema);
