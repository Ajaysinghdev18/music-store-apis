const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SocialSchema = new Schema(
    {
        artistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'artist'
        },
        title: {
            type: String,
        },
        statement: {
            type: String
        },
        contentType: {
            type: String,
            enum: ['video', 'announcement']
        },
        thumbnail: {
            type: Object,
        },
        video: {
            type: Object
        },
        attachment: {
            type: Object
        },
        publishOnSocialMedia: {
            type: Boolean
        },
    },
    {
        toJSON: { virtuals: true },
        timestamps: true
    }
)

module.exports = mongoose.model('social', SocialSchema)