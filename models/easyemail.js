
const mongoose = require("mongoose");

const EasyEmailTemplates = new mongoose.Schema(
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
            enum: ['Welcome', 'Forget_Password', 'new_smart_contract', 'kyc_under_verification',
            'purchase_order_confirmation', 'new_gallery', 'new_product','order_confirmation', 'none'],
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
module.exports = mongoose.model("EasyEmailTemplates", EasyEmailTemplates);