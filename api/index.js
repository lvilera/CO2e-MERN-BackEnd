const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const dns = require('dns');

// Routes & middleware
const cardRoutes = require('../routes/cardRoutes');
const errorHandlerMiddleware = require('../middlewares/errorHandlerMiddleware');
const authRoutes = require('../routes/auth');
const newsRoutes = require('../routes/newsRoutes');
const blogRoutes = require('../routes/blogRoutes');
const courseRoutes = require('../routes/courseRoutes');
const featuredListingRoutes = require('../routes/featuredListingRoutes');
const stripeRoutes = require('../routes/stripe');
const directoryRoutes = require('../routes/directoryRoutes');
const serviceImageRoutes = require('../routes/serviceImageRoutes');
const newsletterRoutes = require('../routes/newsletterRoutes');
const contactRoutes = require('../routes/contactRoutes');
const instructorRoutes = require('../routes/instructor');
const bookingRoutes = require('../routes/bookingRoutes');
const userRoutes = require('../routes/userRoutes');
const guideRoutes = require('../routes/guideRoutes');
const auditRoutes = require('../routes/auditRoutes');
const productRoutes = require('../routes/productRoutes');

let pickAuditFields;
try {
  ({ pickAuditFields } = require('../routes/auditRoutes'));
} catch (_) {}

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  console.log('⚠️  Using default DNS resolution order');
}

const app = express();

// ---------- CORS ----------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://co2e.vercel.app',
  'https://www.co2eportal.com',
  'https://co2eportal.com',
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
};

// Stripe raw body only for webhook
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/stripe/webhooks')) {
    return express.raw({ type: 'application/json' })(req, res, next);
  }
  return express.json()(req, res, next);
});

app.use(cookieParser());

app.use(
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin || 'unknown'}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })
);

// ✅ Use RegExp for preflight (or delete this block entirely per Option A)
app.options(
  /.*/,
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error('CORS preflight blocked'));
    },
    credentials: true,
  })
);

// ---------- Static ----------
app.use('/report', express.static(path.join(__dirname, '../report')));

// ---------- Debug ----------
//console.log('Using Stripe key:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...');

// ---------- Safari/iOS auth header → cookie bridge ----------
app.use((req, _res, next) => {
  if (!req.cookies.token && req.headers.authorization?.startsWith('Bearer ')) {
    req.cookies.token = req.headers.authorization.replace('Bearer ', '');
  }
  next();
});

// ---------- Routes ----------
app.use('/api', authRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/card', cardRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/featured-listings', featuredListingRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/service-images', serviceImageRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/products', productRoutes);

if (pickAuditFields && typeof pickAuditFields === 'function') {
  app.use('/api/audits', pickAuditFields);
}

// ---------- Error handler ----------
app.use(errorHandlerMiddleware);

// ---------- Mongo ----------
const mongoOptions = [
  'mongodb+srv://Data1:Data_01_MongoDB@cluster.jyy8bnn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster',
];

let currentUriIndex = 0;

const connectWithRetry = async () => {
  try {
    const uri = mongoOptions[currentUriIndex];
    console.log(`🔄 Attempting to connect to MongoDB (option ${currentUriIndex + 1}/${mongoOptions.length})...`);

    if (uri.includes('mongodb+srv://')) {
      const hostname = 'cluster.jyy8bnn.mongodb.net';
      try {
        const { lookup } = require('dns').promises;
        await lookup(hostname);
        console.log(`✅ DNS resolution successful for ${hostname}`);
      } catch (e) {
        console.log(`⚠️  DNS resolution failed for ${hostname}: ${e.message}`);
        process.env.DNS_SERVERS = '8.8.8.8,8.8.4.4';
      }
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 30000,
    });

    console.log('✅ Connected to MongoDB successfully!');

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(`❌ MongoDB connection failed (option ${currentUriIndex + 1}):`, err.message);
    currentUriIndex++;

    if (currentUriIndex < mongoOptions.length) {
      console.log('🔄 Retrying next connection option in 3 seconds...');
      setTimeout(connectWithRetry, 3000);
    } else {
      console.log('❌ All MongoDB connection options failed!');
      console.log('💡 Troubleshooting: check internet, Atlas access, DNS (8.8.8.8), IP whitelist');
      const PORT = process.env.PORT || 5001;
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT} (NO DATABASE)`);
        console.log('⚠️  Note: Database-dependent features will not work.');
      });
    }
  }
};

connectWithRetry();

module.exports = app;
