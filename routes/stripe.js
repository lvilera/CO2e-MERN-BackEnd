const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const stripe = require('../configs/stripe.config');
const userService = require('../services/userService');
const stripeService = require('../services/stripeService');
const subscriptionService = require('../services/subscriptionService');

// Health check endpoint to test Stripe connection
router.get('/health', async (req, res) => {
  try {
    // Test Stripe connection by getting account info
    const account = await stripe.accounts.retrieve();
    res.json({
      status: 'Stripe is working',
      account: account.id,
      stripeKey: process.env.STRIPE_SECRET_KEY ? 'Using env var' : 'Using fallback key'
    });
  } catch (error) {
    console.error('Stripe health check failed:', error);
    res.status(500).json({
      status: 'Stripe connection failed',
      error: error.message,
      stripeKey: process.env.STRIPE_SECRET_KEY ? 'Using env var' : 'Using fallback key'
    });
  }
});

// create stripe checkout
router.post('/create-checkout-session', authMiddleware.authenticateRequest, async (req, res, next) => {
  try {
    const CLIENT_URL = req.get('origin');
    const { priceId } = req.body;

    if (!priceId) {
      const error = new Error('Missing PriceId');
      error.code = 400;
      throw error;
    }

    const userId = req.user?.userId;
    let stripeCustomerId = await userService.fetchUserStripeCustomerId(userId);
    if (!stripeCustomerId) {
      const user = await userService.fetchUser(userId);
      stripeCustomerId = await stripeService.createCustomer(user.name, user.email);
      await userService.updateUser(userId, { stripeCustomerId });
    }
    const sessionURL = await stripeService.createCheckoutSession(priceId, stripeCustomerId, CLIENT_URL);
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
