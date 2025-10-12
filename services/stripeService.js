const commonService = require('./commonService');
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

const createCheckoutSession = async (priceId, stripeCustomerId, CLIENT_URL) => {
    try {
        const session = await stripe.checkout.sessions.create(
            {
                mode: "subscription",
                payment_method_types: ["card"],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                success_url: `${CLIENT_URL}/success`,
                cancel_url: `${CLIENT_URL}/cancel`,
                customer: stripeCustomerId,
            }
        );
        return session.url;
    } catch (error) {
        console.log("Stripe Checkout Error: ", error);
        const newError = new Error('Unable to create checkout session!');
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
    createCheckoutSession,
    updateSubscription
}