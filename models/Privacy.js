const mongoose = require("mongoose");

const PrivacySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: ""
    },
    content: {
      type: String,
      default: "",
      maxlength: 5000
    }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("Privacy", PrivacySchema);
