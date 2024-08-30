const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContractDetailsSchema = new Schema({
  chain: {
    type: String,
    enum: ['CSPR', 'ETH'],
  },
  network: {
    type: String,
    enum: ['testnet', 'mainnet'],
  },
  transactionHash: {
    type: String
  },
  gasUsed: {
    type: String
  },
  from: {
    type: String
  },
});

const ContractSchema = new Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "artist"
    },
    contractHash: {
      type: String
    },
    contractAddress: {
      type: String
    },
    contractName: {
      type: String
    },
    tokenName: {
      type: String
    },
    tokenSymbol: {
      type: String,
    },
    description: {
      type: String
    },
    details: {
      type: ContractDetailsSchema
    },
    status: {
      type: String,
      enum: ['pending', 'succeed', 'error'],
      default: 'pending'
    },
    error: {
      type: String,
      default: ''
    }
  },
  {
    toJSON: { virtuals: true },
    id: false,
    timestamps: true
  }
);

module.exports = mongoose.model("contract", ContractSchema);
