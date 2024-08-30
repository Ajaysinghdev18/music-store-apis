const mongoose = require("mongoose");
const MultiLanguageSchema = require("./MultiLang");

const UsSchema = new mongoose.Schema(
  {
    title: {
      type: MultiLanguageSchema,
      default: {}
    },
    content: {
      type: MultiLanguageSchema,
      default: {}
    }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("Us", UsSchema);
