const mongoose = require("mongoose");

const NewsLetterTemplates = new mongoose.Schema(
    {
        title: {
            type: String
        },
        subject: {
            type: String
        },
        description: {
            type: String
        },
        contentJSON: {
        },
        contentHtml: {

        },
        template_type: {
            type: String,
            enum: ['published', 'draft'],
            default: 'draft'
        },
        artistId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'artist'
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

module.exports = mongoose.model("NewsLetters", NewsLetterTemplates);
