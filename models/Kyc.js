const mongoose = require("mongoose");

const KYCSchema = new mongoose.Schema(
    {
        nationality: {
            type: String,
            required: [true, "Nationality is required"],
            trim: true
        },
        verified: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["verified", "not-verified", "rejected", "under-verification"],
            required: [true, "ID Type is required"],
            default: 'not-verified'
        },
        reason: {
            type: String,
            default: null
        },
        type: {
            type: String,
            enum: ["driver_licence", "passport", "id_cad"],
            required: [true, "ID Type is required"]
        },
        firstName: {
            type: String,
            required: [true, "First Name is required"],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, "Last Name is required"],
            trim: true
        },
        gender: {
            type: String,
            enum: ["male", "female"],
            required: [true, "Gender is required"]
        },
        birthday: {
            type: String,
            required: [true, "Birthday is required"],
        },
        expiration: {
            type: String,
            required: [true, "Expiration is required"],
        },
        docId: {
            type: String,
        },
        subject: {
            type: String,
            default: null,
            required: false
        },
        idNumber: {
            type: String,
        },
        idFront: {
            type: Object
        },
        idBack: {
            type: Object
        },
        faceId: {
            type: Object
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        _id: {
            type: String,
            required: true
        }
    },
    {
        toJSON: { virtuals: true },
        timestamps: true
    }
);

module.exports = mongoose.model("KYC", KYCSchema);
