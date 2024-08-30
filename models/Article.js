const mongoose = require("mongoose");
const MultiLanguageSchema = require("./MultiLang");

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: MultiLanguageSchema,
      required: [true, "Title is required"]
    },
    description: {
      type: MultiLanguageSchema,
      default: {}
    },
    thumbnail: {
      type: Object,
      required: [true, "Thumbnail is required"]
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    author: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Unpublished"],
      default: "Draft"
    }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("Article", ArticleSchema);
