const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User"
    },
    income: {
      type: Boolean,
      default: true
    },
    content: {
      type: String,
      default: "",
      maxlength: 5000
    },
    favourite: {
      type: Boolean,
      default: false
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("Message", MessageSchema);
