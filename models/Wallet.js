const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "User"
  },
  nfts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'nft'
  }],
  chain: {
    type: String,
  },
  address: {
    type: String,
    required: true
  },
  privateKey: {
    type: String
  },
  iv: {
    type: Object
  },
  default: {
    type: Boolean,
  },
  isConnected: {
    type: Boolean,
  },
  balance: {
    type: Number,
    default: 0
  },
  publicKey: {
    type: String
  }
},
  {
    toJSON: { virtuals: true },
    timestamps: true
  });

module.exports = mongoose.model("wallet", WalletSchema);
