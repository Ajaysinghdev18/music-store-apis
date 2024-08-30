const mongoose = require("mongoose");

const EmailTemplates = new mongoose.Schema(
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
            enum: ['published', 'draft', 'publish'],
            default: 'draft'
        },
        email_type: {
            type: String,
            enum: [
                'user_welcome',
                'artist_welcome',
                'Forget_Password',
                'new_smart_contract',
                'kyc_under_verification',
                'kyc_rejected',
                'kyc_verifed',
                'purchase_order_confirmation',
                'new_gallery',
                'new_product',
                'order_confirmation',
                'none'
            ],
            default: 'none'
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

module.exports = mongoose.model("EmailTemplates", EmailTemplates);
