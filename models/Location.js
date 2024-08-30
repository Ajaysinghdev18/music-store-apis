const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  geoplugin_currencyCode: {
    type: String
  },
  geoplugin_request: String,
  geoplugin_currencySymbol: String,
  geoplugin_countryName: String,
  geoplugin_countryCode: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Location", LocationSchema);
