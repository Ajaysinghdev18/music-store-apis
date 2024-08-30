const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User"
    },
    content: {
      type: Object
    }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("History", HistorySchema);
