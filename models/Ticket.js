const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"]
    },
    answer: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"]
    },
    username: {
      type: String,
      trim: true,
      min: [6, "Minimum is 6 characters"]
    },
    phoneNumber: {
      type: String
    },
    country: {
      type: String
    },
    subject: {
      type: String,
      required: [true, "Subject is required"]
    },
    description: {
      type: String,
      required: [true, "Description is required"]
    },
    category: {
      type: String,
      required: [true, "Category is required"]
    },
    status: {
      type: String,
      enum: ["New", "Processing", "Solved", "Cancelled", "Starred", "Archive"],
      default: "New"
    },
    files: {
      type: [Object]
    },
    _id:{
      type: String,
      required: true
    }
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("Ticket", TicketSchema);
