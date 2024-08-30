const mongoose = require("mongoose")

const ArtistSchema = new mongoose.Schema(
    {
        thumbnail: {
            type: String,
        },
        name: {
            type: String,
            required: [true, "Name is required"]
        },
        email: {
            type: String,
            required: [true, "Email is required"]
        },
        deploymentExecution: {
            type: String,
            enum: ['corporate', 'custom'],
            default: 'corporate'
        },
        ethWallet: {
            type: Object
        },
        csprWallet: {
            type: Object
        },
        bio: {
            type: String,
            default: ""
        },
        spotify: {
            type: String,
            default: ""
        },
        twitter: {
            type: String,
            default: ""
        },
        facebook: {
            type: String,
            default: ""
        },
        discord: {
            type: String,
            default: ""
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        subscriber: {
            type: [mongoose.Schema.Types.ObjectId],
            required: false,
            ref: "User"
        },
        artistURLId: {
            type: String,
            required: false,
            default: ''
        },
        apiKey: {
            type: String
        },
        instagram: {
            type: String
        },
        paypal: {
            type: String,
            default: ""
        },
        ethereumWallet: {
            type: String,
            default: ""
        },
        casperWallet: {
            type: String,
            default: ""
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        website: {
            type: String,
            default: ""
        },
    },
    {
        toJSON: { virtuals: true },
        timestamps: true
    }
)
module.exports = mongoose.model("artist", ArtistSchema);
