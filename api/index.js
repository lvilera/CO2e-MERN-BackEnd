const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const cardRoutes = require('../routes/cardRoutes');
const errorHandlerMiddleware = require('../middlewares/errorHandlerMiddleware');

// Try to fix DNS resolution issues
const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (error) {
  // Fallback for older Node.js versions
  console.log('⚠️  Using default DNS resolution order');
}

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
const productRoutes = require('../routes/productRoutes')

const app = express();

// MongoDB Connection String - Try multiple options with better DNS handling
const mongoOptions = [
  "mongodb+srv://Data1:Data_01_MongoDB@cluster.jyy8bnn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster",
  //"mongodb://ShoaibFarooka:5ddghWES680comTU@ac-y7zuomn-shard-00-00.jyy8bnn.mongodb.net:27017,ac-y7zuomn-shard-00-01.jyy8bnn.mongodb.net:27017,ac-y7zuomn-shard-00-02.jyy8bnn.mongodb.net:27017/?ssl=true&replicaSet=atlas-1fzpzw-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster",
  // "mongodb+srv://ShoaibFarooka:5ddghWES680comTU@cluster.jyy8bnn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster",
  // "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false",
  // "mongodb://aryan:2021cs613@ac-hdxyrp8-shard-00-00.o8bu9nt.mongodb.net:27017,ac-hdxyrp8-shard-00-01.o8bu9nt.mongodb.net:27017,ac-hdxyrp8-shard-00-02.o8bu9nt.mongodb.net:27017/myDatabase?ssl=true&replicaSet=atlas-yh1s3n-shard-0&authSource=admin&retryWrites=true&w=majority&directConnection=false",
  // "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false&serverSelectionTimeoutMS=30000",
  // "mongodb://localhost:27017/myDatabase" // Local fallback
];

let currentUriIndex = 0;
const uri = mongoOptions[currentUriIndex];

// CORS middleware - must be before any routes or express.json()
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://co2e.vercel.app',
    'https://www.co2eportal.com',
    'https://co2eportal.com/',
    // Add common frontend deployment patterns
    /https:\/\/.*\.vercel\.app$/,
    /https:\/\/.*\.netlify\.app$/,
    /https:\/\/.*\.herokuapp\.com$/,
    // For debugging - allow any HTTPS origin
    /https:\/\/.*/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/stripe/webhooks')) {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});
app.use(cookieParser());
app.use('/report', express.static(path.join(__dirname, '../report')));

// Display Stripe key for debugging
console.log('Using Stripe key:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...');

// Middleware to handle Authorization headers for iPhone Safari
app.use((req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

  // For iPhone Safari, if no cookie token but Authorization header exists, set it as cookie
  if (!req.cookies.token && req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer ', '');
    req.cookies.token = token;
  }

  next();
});

// Routes
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

//Error Handler
app.use(errorHandlerMiddleware);

// MongoDB Connection with retry logic and DNS handling
const connectWithRetry = async () => {
  try {
    console.log(`🔄 Attempting to connect to MongoDB (option ${currentUriIndex + 1}/${mongoOptions.length})...`);

    // For Atlas connections, try to resolve DNS first
    if (currentUriIndex < 3) { // First 3 are Atlas connections
      const hostname = mongoOptions[currentUriIndex].includes('mongodb+srv://')
        ? 'cluster.jyy8bnn.mongodb.net'
        : 'ac-hdxyrp8-shard-00-00.o8bu9nt.mongodb.net';

      try {
        const { lookup } = require('dns').promises;
        await lookup(hostname);
        console.log(`✅ DNS resolution successful for ${hostname}`);
      } catch (dnsError) {
        console.log(`⚠️  DNS resolution failed for ${hostname}, trying alternative DNS...`);
        // Try with Google DNS
        process.env.DNS_SERVERS = '8.8.8.8,8.8.4.4';
      }
    }

    await mongoose.connect(mongoOptions[currentUriIndex], {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 30000
    });

    console.log('✅ Connected to MongoDB successfully!');

    // Start server only after successful connection
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error(`❌ MongoDB connection failed with option ${currentUriIndex + 1}:`, err.message);

    // Try next connection option
    currentUriIndex++;

    if (currentUriIndex < mongoOptions.length) {
      console.log(`🔄 Trying next connection option in 3 seconds...`);
      setTimeout(connectWithRetry, 3000);
    } else {
      console.log('❌ All MongoDB connection options failed!');
      console.log('💡 Troubleshooting tips:');
      console.log('1. Check your internet connection');
      console.log('2. Verify MongoDB Atlas is accessible');
      console.log('3. Try using a different DNS server (like 8.8.8.8)');
      console.log('4. Check if your IP is whitelisted in MongoDB Atlas');

      // Start server anyway for development (without database)
      const PORT = process.env.PORT || 5001;
      app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT} (NO DATABASE)`);
        console.log(`⚠️  Note: Database features will not work!`);
      });
    }
  }
};

// Start connection process
connectWithRetry();

module.exports = app; 