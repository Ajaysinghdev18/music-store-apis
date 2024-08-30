const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product Name is required"],
      trim: true
    },
    type: {
      type: String,
      enum: ["song", "video", "virtual_event", "image", "product", "object"],
      required: [true, "Product Type is required"]
    },
    thumbnail: {
      type: Object,
    },
    mask_thumbnail: {
      type: Object
    },
    icon: {
      type: Object
    },
    video: {
      type: Object
    },
    object: {
      type: Object
    },
    image: {
      type: Object
    },
    sign: {
      type: Object
    },
    music: {
      type: Object
    },
    preview: {
      type: Object
    },
    price: {
      type: Number,
      required: [true, "Price is required"]
    },
    sku: {
      type: String
    },
    category: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category"
    },
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction"
    },
    nftIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "nft"
    }],
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "artist"
    },
    artistDetails: {
      type: Object
    },
    galleryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "gallery"
    },
    currency: {
      type: String,
      required: [true, "Currency is required"]
    },
    description: {
      type: String,
      required: [true, "Description is required"]
    },
    txHash: {
      type: String,
      required: false,
      default: ''
    },
    productURLId: {
      type: String,
      default: ''
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isAuction: {
      type: Boolean,
      default: false
    },
    auctionState: {
      type: String,
      enum: ["sold", "open", "close"],
    },
    productFeatures: {
      // type: [
      //   {
      //     name: {
      //       type: String,
      //       required: false,
      //     },
      //     value: {
      //       required: false,
      //     },
      //     type:{
      //       type: String,
      //       enum: ["multiple", "single"],
      //       default: "single"
      //     },
      //   },
      // ],
      type: Array,
    },
    statement: {
      type: String
    },
    isAuction: {
      type: Boolean
    },
    location: String,
    startTime: Date,
    endTime: Date,
    attenders: {
      type: Array,
      required: false
    },
    ownerAddress: String,
    tokenId: String,
    transferTxHash: String,
    chain: String,
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("Product", ProductSchema);
