const mongoose = require("mongoose");



const bidSchema = new mongoose.Schema({
    bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    amount: {
        type: Number,
    },
    coin: {
        type: String,
        enum: ['ETH', 'CSPR'],
        default: 'ETH'
    },
    status: {
        type: String,
    }
}, {
    timestamps: true
});

const AuctionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        startingPrice: {
            type: Number,
        },
        currentHighestBid: {
            type: Number,
            default: 0
        },
        latestBid: {
            type: Number,
        },
        startTime: {
            type: Date,
            default: Date.now
        },
        endTime: {
            type: Date,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artist',
            required: true
        },
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        ended: {
            type: Boolean,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        bids: [bidSchema]
    },
    {
        toJSON: { virtuals: true },
        timestamps: true
    }
)
module.exports = mongoose.model("Auction", AuctionSchema);
