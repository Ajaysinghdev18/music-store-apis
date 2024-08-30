const mongoose = require("mongoose");
const MultiLanguageSchema = require("./MultiLang");

const FaqQuestion = new mongoose.Schema(
  {
    title: {
      type: MultiLanguageSchema,
      required: [true, "Title is required"]
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaqCategory",
      required: [true, "Category is required"]
    },
    answer: {
      type: MultiLanguageSchema,
      default: ""
    }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("FaqQuestion", FaqQuestion);
