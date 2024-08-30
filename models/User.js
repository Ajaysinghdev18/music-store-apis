const mongoose = require("mongoose");
const validator = require('validator');

const NOTIFICATION_VALUES = [
  "all-notifications",
  "email-successful-orders-process",
  "sms-successful-orders-process",
  "email-orders-recipe",
  "sms-orders-recipe",
  "email-new-products",
  "sms-new-products"
];

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true
    },
    username: {
      type: String,
      trim: true,
      min: [6, "Minimum is 6 characters"],
      unique: true
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      validate: {
        validator: (value) => {
          return validator.isEmail(value);
        },
        message: 'Please add a valid email',
      },
      unique: true
    },
    verify: {
      type: Boolean,
      default: false
    },
    isKYCVerified: {
      type: Boolean,
      default: false
    },
    KYCStatus: {
      type: String,
      default: 'not-verified',
      enum: ["verified", "not-verified", "rejected", "under-verification"],
    },
    block: {
      type: Boolean,
      default: false
    },
    avatar: {
      type: Object
    },
    password: {
      type: String,
      required: [true, "Please add a password"]
    },
    birthday: {
      type: String,
      trim: true
    },
    casperWalletAddress: {
      type: String,
    },
    walletPrivateKey:
    {
      data: Buffer,
      type: String
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'artist'
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    applicationId: {
      type: String,
      default: null
    },
    role: {
      type: String,
      default: "user",
      enum: ["admin", "user", "artist"]
    },
    notificationSettings: {
      type: Array,
      default: NOTIFICATION_VALUES
    },
    favoriteProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      required: false,
      ref: "Product"
    },
    subscribedArtist: {
      type: [mongoose.Schema.Types.ObjectId],
      required: false,
      ref: "artist"
    },
    country: {
      type: String,
    },
    region: {
      type: String
    },
    city: {
      type: String
    },
    addressLine1: {
      type: String
    },
    addressLine2: {
      type: String
    },
    zip: {
      type: String
    },
    language: {
      type: String
    },
    currency: {
      type: String
    },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true
  }
);

module.exports = mongoose.model("User", UserSchema);
