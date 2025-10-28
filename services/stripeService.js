const commonService = require('./commonService');
const Product = require('../models/Product');
const stripe = require('../configs/stripe.config');

const webHookKey = process.env.STRIPE_WEBHOOK_KEY || 'whsec_RHCz1vmgSr97f6KQYKJdprG4B3ulsr9I';

const createCustomer = async (name, email) => {
    const customer = await stripe.customers.create({ name, email });
    if (!customer) {
        const error = new Error('Unable to create customer!');
        error.code = 400;
        throw error;
    }
    return customer.id;
};

// const updateCustomerEmail = async (stripeCustomerId, newEmail) => {
//     const customer = await stripe.customers.update(stripeCustomerId, {
//         email: newEmail,
//     });
//     if (!customer) {
//         const error = new Error('Unable to update customer!');
//         error.code = 400;
//         throw error;
//     }
// };

const createCheckoutSession = async (priceId, stripeCustomerId, CLIENT_URL, mode = "subscription", type = "subscription", quantity = 1) => {
    try {
        // Validate input
        if (!priceId || !stripeCustomerId || !CLIENT_URL) {
            const error = new Error("Missing required parameters!");
            error.code = 400;
            throw error;
        }

        const session = await stripe.checkout.sessions.create({
            mode,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: quantity,
                },
            ],
            success_url: `${CLIENT_URL}/success?mode=${mode}&type=${type}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/cancel?mode=${mode}&type=${type}`,
            customer: stripeCustomerId,
            metadata: {
                type, // "subscription", "product", "token", etc.
                quantity: quantity, // store for webhook reference
            },
        });

        return session.url;
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        const newError = new Error("Unable to create checkout session!");
        newError.code = 400;
        throw newError;
    }
};

const constructEvent = async (sig, data) => {
    try {
        const event = stripe.webhooks.constructEvent(data, sig, webHookKey);
        return event;
    } catch (err) {
        const newError = new Error(`Unable to construct event!`);
        newError.code = 400;
        throw newError;
    }
};

const handlePaymentSucceededEvent = async (event) => {
    try {
        const invoice = event.data.object;
        console.log("Invoice: ", invoice);
        console.log("Lines: ", invoice.lines.data[invoice.lines.data.length - 1]);
        const customerId = invoice.customer;

        const userId = await commonService.fetchUserId({ stripeCustomerId: customerId });
        const invoiceId = invoice.id;

        const billingReason = invoice.billing_reason;
        // subscription_create
        const subscriptionId =
            invoice.subscription ||
            invoice.lines.data[0]?.parent?.subscription_item_details?.subscription ||
            null;

        const productId = invoice.lines.data[invoice.lines.data.length - 1].pricing.price_details.product;
        const { name, description } = await stripe.products.retrieve(productId);

        const lineItem = invoice.lines.data[invoice.lines.data.length - 1];
        const priceDetails = lineItem.pricing.price_details;

        const planInfo = {
            productId,
            name,
            description: description || 'N/A',
            priceId: priceDetails.price,
            amount: parseInt(lineItem.amount) / 100,
            currency: invoice.currency,
        };
        const paidAmount = invoice.amount_paid / 100;
        const startDate = new Date(lineItem.period.start * 1000).toISOString();
        const endDate = new Date(lineItem.period.end * 1000).toISOString();
        const data = {
            user: userId,
            customerId,
            subscriptionInfo: {
                subscriptionId,
                invoiceId,
                planInfo,
                paidAmount,
                billingReason,
                startDate,
                endDate
            }
        };
        return data;
    } catch (error) {
        console.log("Success Event Error: ", error);
        const newError = new Error(`Unable to fetch info from event!`);
        newError.code = 400;
        throw newError;
    }
};

const handleSessionCompletedEvent = async (event) => {
    try {
        const session = event.data.object;
        const stripeSessionId = session.id;
        const stripePaymentIntentId = session.payment_intent;
        const customerId = session.customer;
        const quantity = Number(session.metadata?.quantity);

        const userId = await commonService.fetchUserId({ stripeCustomerId: customerId });

        const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, { limit: 1 });
        const priceId = lineItems.data[0].price.id;
        const product = await Product.findOne({ stripePriceId: priceId });

        if (!product) {
            console.warn('Product not found for priceId:', priceId);
            return res.status(400).json({ message: 'Product not found.' });
        }

        const data = {
            stripeSessionId,
            stripePaymentIntentId,
            user: userId,
            customerId,
            product: product._id,
            quantity,
            status: "paid"
        }
        return data;
    } catch (error) {
        console.log("Session Completed Event Error: ", error);
        const newError = new Error(`Unable to fetch info from event!`);
        newError.code = 400;
        throw newError;
    }
};

const updateSubscription = async (subscriptionId, newPriceId) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            items: [{
                id: subscription.items.data[0].id,
                price: newPriceId
            }],
            proration_behavior: 'always_invoice',
        });

        return updatedSubscription;
    } catch (error) {
        const newError = new Error(`Unable to update subscription!`);
        newError.code = 400;
        throw newError;

    }
};

module.exports = {
    createCustomer,
    // updateCustomerEmail,
    constructEvent,
    handlePaymentSucceededEvent,
    handleSessionCompletedEvent,
    createCheckoutSession,
    updateSubscription
}