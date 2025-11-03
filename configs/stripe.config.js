const path = require('path');
const dotenvPath = path.resolve(__dirname, '../.env');
console.log('Loading .env from:', dotenvPath);

require('dotenv').config({ path: dotenvPath });

//console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Loaded ✅' : 'Not found ❌');

const Stripe = require('stripe');
const { STRIPE_SECRET_KEY } = process.env;

if (!STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

module.exports = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
