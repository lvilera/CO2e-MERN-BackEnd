const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const stripe = require('../configs/stripe.config');
const userService = require('../services/userService');
const stripeService = require('../services/stripeService');
const subscriptionService = require('../services/subscriptionService');
const orderService = require('../services/orderService');

// Health check endpoint to test Stripe connection
router.get('/health', async (req, res) => {
  try {
    // Test Stripe connection by getting account info
    const account = await stripe.accounts.retrieve();
    res.json({
      status: 'Stripe is working',
      account: account.id,
     stripeKey: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING'
    });
  } catch (error) {
    console.error('Stripe health check failed:', error);
    res.status(500).json({
      status: 'Stripe connection failed',
      error: error.message,
      stripeKey: process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING'
    });
  }
});

// create stripe checkout
router.post('/create-checkout-session', authMiddleware.authenticateRequest, async (req, res, next) => {
  try {
    const CLIENT_URL = req.get('origin');
    const { priceId, mode, type, quantity } = req.body;

    if (!priceId) {
      const error = new Error('Missing PriceId');
      error.code = 400;
      throw error;
    }

    if (!type) {
      const error = new Error('Missing Type');
      error.code = 400;
      throw error;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      const error = new Error('Invalid quantity! Must be an integer.');
      error.code = 400;
      throw error;
    }

    if (!["subscription", "payment"].includes(mode)) {
      const error = new Error('Invalid mode! Must be "subscription" or "payment".');
      error.code = 400;
      throw error;
    }

    const userId = req.user?.userId;
    let stripeCustomerId = await userService.fetchUserStripeCustomerId(userId);
    if (!stripeCustomerId) {
      const user = await userService.fetchUser(userId);
      console.log(user);
      const name = user.firstName + '' + user.lastName
      stripeCustomerId = await stripeService.createCustomer(name, user.email);
      console.log(stripeCustomerId);
      await userService.updateUser(userId, { stripeCustomerId });
    }
    const sessionURL = await stripeService.createCheckoutSession(priceId, stripeCustomerId, CLIENT_URL, mode, type, quantity);
    res.status(200).json({ url: sessionURL });
  } catch (error) {
    console.log("Stripe Checkout Error: ", error);
    next(error);
  }
});

router.post('/webhooks', async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const data = req.body;
    const event = await stripeService.constructEvent(sig, data);

    switch (event?.type) {
      case 'invoice.payment_succeeded':
        const paymentData = await stripeService.handlePaymentSucceededEvent(event);
        await subscriptionService.addSubscription(paymentData);
        res.status(200).json({ message: 'Subscription created!' });
        break;
      case 'checkout.session.completed':
        const session = event.data.object;
        const paymentType = session.metadata?.type;
        if (paymentType === "product") {
          const orderData = await stripeService.handleSessionCompletedEvent(event);
          await orderService.createOrder(orderData);
          return res.status(200).json({ message: 'Product order created!' });
        }

        return res.status(200).json({ message: 'Checkout session completed (unhandled type).' });
      default:
        res.status(200).json({ message: 'Unhandled webhooks event!' });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/update-subscription', authMiddleware.authenticateRequest, async (req, res, next) => {
  try {
    const { newPriceId } = req.body;
    const userId = req.user?.userId;

    if (!newPriceId) {
      const error = new Error('Missing newPriceId');
      error.code = 400;
      throw error;
    }

    const subscriptionInfo = await subscriptionService.getUserSubscriptionInfo(userId);
    if (!subscriptionInfo || !subscriptionInfo.status) {
      const error = new Error('No active subscription found.');
      error.code = 400;
      throw error;
    }

    await stripeService.updateSubscription(subscriptionInfo.subscriptionId, newPriceId);

    res.status(200).json({
      message: 'Subscription updated successfully!'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
