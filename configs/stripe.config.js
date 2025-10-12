const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_API_KEY || 'sk_test_51Rj1BHBwwMNNzzzsjwDBeLycAGXndWqDaOM3izFSPAOP8xf7eXBmvGpunL90DhyZCvVaXvHvfgApufjRxt3GliV5008cNT31Nn');

module.exports = stripe;