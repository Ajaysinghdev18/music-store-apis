const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const GallerySchema = new Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "artist"
    },
    name: {
      type: String
    },
    galleryURLId: {
      type: String,
      required: false,
      default: ''
    },
    thumbnail: {
      type: String
    },
    description: {
      type: String
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "contract"
    },
    isFeatured: {
      type: Boolean
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    chain: {
      type: String,
      enum: ['ETH', 'CSPR']
    },
    network: {
      type: String,
      enum: ['testnet', 'mainnet']
    }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("gallery", GallerySchema);
