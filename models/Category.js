const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category Name is required"],
      trim: true
    },
    visibleInNav: {
      type: Boolean,
      required: true
    },
    subCategories: [
      {
        type: String
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("Category", CategorySchema);
