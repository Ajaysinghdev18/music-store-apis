const mongoose = require("mongoose");

const TermSchema = new mongoose.Schema(
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

module.exports = mongoose.model("Term", TermSchema);
