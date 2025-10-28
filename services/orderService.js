const Order = require('../models/Order');

const createOrder = async (data) => {
    try {
        const { stripeSessionId, stripePaymentIntentId, user, customerId, product, quantity, status } = data;
        const newOrder = await Order.create({
            stripeSessionId,
            stripePaymentIntentId,
            user,
            customerId,
            product,
            quantity,
            status
        });
        return newOrder;
    } catch (error) {
        console.log('CreateOrderError: ', error);
        const newError = new Error(`Unable to create order!`);
        newError.code = 400;
        throw newError;
    }
};

const getUserOrders = async (userId) => {
    const orders = await Order.find({ user: userId }).populate("product");
    if (!orders || orders.length <= 0) {
        const error = new Error('Orders not found!');
        error.code = 404;
        throw error;
    }

    return orders;
};

module.exports = {
    createOrder,
    getUserOrders,
}