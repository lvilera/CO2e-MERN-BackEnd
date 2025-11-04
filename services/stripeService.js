// services/stripeService.js
const commonService = require('./commonService');
const Product = require('../models/Product');
const stripe = require('../configs/stripe.config');

// DO NOT hardcode webhook secret in code. Require it from env.
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_KEY;
if (!WEBHOOK_SECRET) {
  // Fail fast in non-test envs; in dev you can set it in .env
  console.warn('[stripe] Missing STRIPE_WEBHOOK_KEY in env. Webhook verify will fail.');
}

/* --------------------------- Utilities / Guards --------------------------- */

async function assertPriceExists(priceId, opts = {}) {
  try {
    const price = await stripe.prices.retrieve(priceId, opts);
    if (!price?.active) {
      const err = new Error(`Stripe Price found but inactive/archived: ${priceId}`);
      err.code = 400;
      throw err;
    }
    return price;
  } catch (e) {
    // Match Stripe's "resource_missing"
    if (e?.raw?.code === 'resource_missing') {
      const err = new Error(`Stripe Price not found in this account/mode: ${priceId}`);
      err.code = 400;
      throw err;
    }
    throw e;
  }
}

function buildSuccessCancelUrls(origin) {
  const base = origin || process.env.CLIENT_URL || 'https://co2eportal.com/';
  return {
    success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/cancel`,
  };
}

function idempoKey(customerId, priceId, mode) {
  return `co_${customerId}_${priceId}_${mode}_${Date.now()}`;
}

/* --------------------------------- API ---------------------------------- */

async function createCustomer(name, email, opts = {}) {
  const params = { name, email }; // must be a single object
  const requestOptions = {};
  if (opts.idempotencyKey) requestOptions.idempotencyKey = opts.idempotencyKey;

  // DO NOT pass a second params object here
  const customer = await stripe.customers.create(params, requestOptions);
  return customer; // caller should use customer.id
}
const createCheckoutSession = async (
  priceId,
  stripeCustomerId,
  CLIENT_URL,
  mode = 'subscription',
  type = 'subscription',
  quantity = 1,
  opts = {}
) => {
  try {
    // Basic input validation
    if (!priceId || !stripeCustomerId || !CLIENT_URL) {
      const error = new Error('Missing required parameters!');
      error.code = 400;
      throw error;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      const error = new Error('Invalid quantity! Must be an integer >= 1.');
      error.code = 400;
      throw error;
    }
    if (!['subscription', 'payment'].includes(mode)) {
      const error = new Error('Invalid mode! Must be "subscription" or "payment".');
      error.code = 400;
      throw error;
    }

    // 1) Guard: verify price exists in THIS account/mode
    const price = await assertPriceExists(priceId, opts);

    // 2) Mode alignment: recurring price requires "subscription"; one_time requires "payment"
    if (mode === 'subscription' && !price.recurring) {
      const err = new Error(`Mode mismatch: requested "subscription" but price is one_time: ${priceId}`);
      err.code = 400;
      throw err;
    }
    if (mode === 'payment' && price.recurring) {
      const err = new Error(`Mode mismatch: requested "payment" but price is recurring: ${priceId}`);
      err.code = 400;
      throw err;
    }

    const { success_url, cancel_url } = buildSuccessCancelUrls(CLIENT_URL);

    const session = await stripe.checkout.sessions.create(
      {
        mode,
        // payment_method_types no longer needed; Stripe defaults handle this
        line_items: [{ price: priceId, quantity }],
        success_url,
        cancel_url,
        customer: stripeCustomerId,
        metadata: {
          type,                // e.g., "subscription" | "product"
          quantity: String(quantity),
          price_id: priceId,
        },
        allow_promotion_codes: true,
      },
      { ...opts, idempotencyKey: idempoKey(stripeCustomerId, priceId, mode) }
    );

    if (!session?.url) {
      const err = new Error('Stripe returned no Checkout URL');
      err.code = 502;
      throw err;
    }
    return session.url;
  } catch (error) {
    // Log minimal details; avoid leaking secrets
    console.error('Stripe Checkout Error:', {
      message: error.message,
      code: error.code || error?.raw?.code,
    });
    const newError = new Error('Unable to create checkout session!');
    newError.code = 400;
    throw newError;
  }
};

// IMPORTANT: this must receive the RAW body from Express (express.raw())
// See server wiring note below.
const constructEvent = async (sig, rawBody) => {
  try {
    if (!WEBHOOK_SECRET) {
      const e = new Error('Webhook secret not configured');
      e.code = 500;
      throw e;
    }
    return stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    const newError = new Error('Unable to construct event!');
    newError.code = 400;
    throw newError;
  }
};

const handlePaymentSucceededEvent = async (event) => {
  try {
    const invoice = event.data.object;

    // Defensive parsing — Stripe fields evolve; avoid deep brittle paths.
    const customerId = invoice.customer;
    const lines = Array.isArray(invoice.lines?.data) ? invoice.lines.data : [];
    const lastLine = lines[lines.length - 1];

    const userId = await commonService.fetchUserId({ stripeCustomerId: customerId });
    const invoiceId = invoice.id;
    const billingReason = invoice.billing_reason;

    // subscriptionId may sit on invoice.subscription; avoid older nested fields
    const subscriptionId = invoice.subscription || null;

    // Price & product
    const priceId = lastLine?.price?.id || lastLine?.plan?.id || null;
    const productId =
      lastLine?.price?.product || lastLine?.plan?.product || lastLine?.plan?.product_id || null;

    let productMeta = { name: 'N/A', description: 'N/A' };
    if (productId) {
      const prod = await stripe.products.retrieve(productId);
      productMeta = { name: prod?.name || 'N/A', description: prod?.description || 'N/A' };
    }

    const amount = (invoice.amount_paid ?? lastLine?.amount ?? 0) / 100;
    const currency = (invoice.currency || lastLine?.currency || 'usd').toLowerCase();

    const periodStart = (lastLine?.period?.start ?? invoice.period_start ?? null);
    const periodEnd = (lastLine?.period?.end ?? invoice.period_end ?? null);

    const planInfo = {
      productId: productId || 'unknown_product',
      name: productMeta.name,
      description: productMeta.description || 'N/A',
      priceId: priceId || 'unknown_price',
      amount,
      currency,
    };

    const data = {
      user: userId,
      customerId,
      subscriptionInfo: {
        subscriptionId,
        invoiceId,
        planInfo,
        paidAmount: amount,
        billingReason,
        startDate: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        endDate: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      },
    };

    return data;
  } catch (error) {
    console.log('Success Event Error: ', error);
    const newError = new Error('Unable to fetch info from event!');
    newError.code = 400;
    throw newError;
  }
};

const handleSessionCompletedEvent = async (event) => {
  try {
    const session = event.data.object;
    const stripeSessionId = session.id;
    const stripePaymentIntentId = session.payment_intent || null;
    const customerId = session.customer;
    const quantity = Number(session.metadata?.quantity || '1');

    const userId = await commonService.fetchUserId({ stripeCustomerId: customerId });

    // Get the line item to resolve Price -> your Product
    const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, { limit: 1 });
    const line = lineItems.data?.[0];
    const priceId = line?.price?.id;

    if (!priceId) {
      const err = new Error('No Price ID found on session line items.');
      err.code = 400;
      throw err;
    }

    // Your schema: Product has stripePriceId
    const product = await Product.findOne({ stripePriceId: priceId });

    if (!product) {
      // Don’t call res.status() here — this is a service layer.
      const err = new Error(`Product not found for priceId: ${priceId}`);
      err.code = 400;
      throw err;
    }

    return {
      stripeSessionId,
      stripePaymentIntentId,
      user: userId,
      customerId,
      product: product._id,
      quantity,
      status: 'paid',
    };
  } catch (error) {
    console.log('Session Completed Event Error: ', error);
    const newError = new Error('Unable to fetch info from event!');
    newError.code = 400;
    throw newError;
  }
};

const updateSubscription = async (subscriptionId, newPriceId, opts = {}) => {
  try {
    await assertPriceExists(newPriceId, opts);
    const sub = await stripe.subscriptions.retrieve(subscriptionId, opts);
    const itemId = sub.items?.data?.[0]?.id;
    if (!itemId) {
      const e = new Error('Subscription has no items to update.');
      e.code = 400;
      throw e;
    }
    return await stripe.subscriptions.update(
      subscriptionId,
      {
        items: [{ id: itemId, price: newPriceId }],
        proration_behavior: 'create_prorations',
      },
      opts
    );
  } catch (error) {
    const newError = new Error('Unable to update subscription!');
    newError.code = 400;
    throw newError;
  }
};

module.exports = {
  createCustomer,
  createCheckoutSession,
  constructEvent,
  handlePaymentSucceededEvent,
  handleSessionCompletedEvent,
  updateSubscription,
};
