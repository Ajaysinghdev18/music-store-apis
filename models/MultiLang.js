const mongoose = require("mongoose");
const MultiLanguageSchema = new mongoose.Schema({
  en: {
    type: String
  },
  nl: {
    type: String
  },
  de: {
    type: String
  },
  fr: {
    type: String
  }
});

module.export = MultiLanguageSchema;
