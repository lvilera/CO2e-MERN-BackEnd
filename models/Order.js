const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    stripeSessionId: {
        type: String,
        required: true,
        trim: true
    },
    stripePaymentIntentId: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    customerId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;