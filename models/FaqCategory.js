const mongoose = require("mongoose");
const MultiLanguageSchema = require("./MultiLang");

const FaqCategory = new mongoose.Schema(
  {
    title: {
      type: MultiLanguageSchema,
      required: [true, "Title is required"]
    },
    questions: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "FaqQuestion"
    }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("FaqCategory", FaqCategory);
