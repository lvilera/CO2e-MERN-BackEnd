const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        priceId: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            trim: true
        },
    },
    {
        _id: false
    }
);

const subscriptionsArraySchema = new mongoose.Schema(
    {
        subscriptionId: {
            type: String,
            required: true,
            trim: true
        },
        invoiceId: {
            type: String,
            required: true,
            trim: true
        },
        planInfo: {
            type: planSchema,
            required: true
        },
        paidAmount: {
            type: Number,
            required: true
        },
        billingReason: {
            type: String,
            required: true,
            trim: true
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'refunded'],
            default: 'active'
        },
        autoRenew: {
            type: Boolean,
            default: true,
        }
    },
    {
        _id: false
    }
);

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true,
    },
    customerId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    subscriptions: {
        type: [subscriptionsArraySchema],
        required: true
    }
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;