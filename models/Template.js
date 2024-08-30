const mongoose = require("mongoose");

const Templates = new mongoose.Schema(
    {
        title:{
            type: String
        },
        contentJSON: {
        },
        contentHtml: {
        },
        cssContent: {
        },
        styleContent: {
        },
        thumbnail: {
            type: Object
        },
    },
    {
        toJSON: { virtuals: true },
        timestamps: true
    }
);

module.exports = mongoose.model("Templates", Templates);
