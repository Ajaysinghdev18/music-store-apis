const mongoose = require("mongoose");


const CouponSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        code: {
            type: String,
            required: true,
            unique: true // Ensures uniqueness of coupon codes
        },
        discountPercentage: {
            type: Number,
            required: true
        },
        expirationDate: {
            type: Date,
        },
        isValid: {
            type: Boolean,
        }
    },
    {
        toJSON: { virtuals: true },
        timestamps: true
    }
)
module.exports = mongoose.model("Coupon", CouponSchema);
