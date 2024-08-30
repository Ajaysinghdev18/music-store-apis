const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const NftSchema = new Schema(
    {
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'contract'
        },
        artistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'artist'
        },
        galleryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'gallery'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        details: {
            network: {
                type: String,
                enum: ['testnet', 'mainnet']
            },
            chain: {
                type: String
            },
            to: {
                type: String
            },
            transactionHash: String,
            error: {
                type: String,
                default: null
            }
        },
        ipfsImageHash: {
            type: String
        },
        ipfsFileHash: {
            type: String
        },
        tokenId: {
            type: String,
        },
        status: Boolean,
        isMinted: {
            type: Boolean,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    },
    {
        toJSON: { virtuals: true },
        id: false,
        timestamps: true
    }
);

module.exports = mongoose.model("nft", NftSchema);