const mongoose = require("mongoose");

const CMSTemplates = new mongoose.Schema(
    {
        _id: {
            type: String
        },
        id: {
            type: String
        },
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
        template_type: {
            type: String,
            enum: ['published', 'draft'],
            default: 'draft'
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

module.exports = mongoose.model("CMSTemplates", CMSTemplates);
