const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY ??'sk_test_51Rj1BnQqlrTjfVZHQxOrodCldv1ac5l72oVnAVgOdyZ7Z1bEBwIStbD012CS4ZKG9gVSpqw701l5yz4NVlWKQkR1009JlSK0Il');

module.exports = stripe;