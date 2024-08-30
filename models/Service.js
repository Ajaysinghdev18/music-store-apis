const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServiceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  secretKey: {
    type: String,
  },
  publishableKey: {
    type: String,
    required: true
  },
  accessKey: {
    type: String
  },
  accessKeyId: {
    type: String
  },
  publicKey: {
    type: String
  },
},
  {
    toJSON: { virtuals: true },
    timestamps: true
  });

module.exports = mongoose.model("service", ServiceSchema);
