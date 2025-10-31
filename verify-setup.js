/**
 * CO2e Backend Setup Verification Script
 *
 * This script verifies that all necessary components are configured correctly.
 * Run with: node verify-setup.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 CO2e Backend Setup Verification\n');
console.log('=' .repeat(50));

// Check 1: Environment variables
console.log('\n✓ Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('  ✅ .env file exists');

  // Load environment variables
  require('dotenv').config({ path: envPath });

  const requiredVars = [
    'MONGODB_URI',
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'CLOUDINARY_CLOUD_NAME'
  ];

  const missingVars = requiredVars.filter(v => !process.env[v]);

  if (missingVars.length === 0) {
    console.log('  ✅ All required environment variables are set');
  } else {
    console.log('  ⚠️  Missing environment variables:', missingVars.join(', '));
  }
} else {
  console.log('  ❌ .env file not found! Please create one from env-template.txt');
  process.exit(1);
}

// Check 2: Node modules
console.log('\n✓ Checking dependencies...');
const packageJsonPath = path.join(__dirname, 'package.json');
const nodeModulesPath = path.join(__dirname, 'node_modules');

if (fs.existsSync(nodeModulesPath)) {
  console.log('  ✅ node_modules directory exists');
} else {
  console.log('  ❌ node_modules not found! Run: npm install');
  process.exit(1);
}

// Check 3: MongoDB Connection
console.log('\n✓ Testing MongoDB connection...');
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.log('  ❌ MONGODB_URI not set in .env');
  process.exit(1);
}

console.log(`  📡 Connecting to: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('  ✅ Successfully connected to MongoDB!');

    // Check 4: Collections
    console.log('\n✓ Checking database collections...');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log('  ℹ️  Database is empty (no collections yet)');
      console.log('  💡 This is normal for a fresh installation');
    } else {
      console.log(`  ✅ Found ${collections.length} collection(s):`);
      collections.forEach(col => {
        console.log(`     - ${col.name}`);
      });
    }

    // Check 5: Count documents
    console.log('\n✓ Checking document counts...');
    try {
      const User = require('./models/User');
      const UserDirectory = require('./models/UserDirectory');
      const AdminDirectory = require('./models/AdminDirectory');

      const userCount = await User.countDocuments();
      const userDirCount = await UserDirectory.countDocuments();
      const adminDirCount = await AdminDirectory.countDocuments();

      console.log(`  📊 Users: ${userCount}`);
      console.log(`  📊 User Directories: ${userDirCount}`);
      console.log(`  📊 Admin Directories: ${adminDirCount}`);
    } catch (error) {
      console.log('  ℹ️  Models not yet initialized (normal for first run)');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Setup Verification Complete!\n');
    console.log('📌 Next Steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Test the API: curl http://localhost:5001/api/directory');
    console.log('   3. Review documentation: cat SETUP_GUIDE.md');
    console.log('   4. (Optional) Seed test data: npm run seed:test\n');

    await mongoose.disconnect();
    process.exit(0);
  })
  .catch((error) => {
    console.log('  ❌ Failed to connect to MongoDB');
    console.log('  📝 Error:', error.message);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('   - For local MongoDB: Make sure mongod is running');
    console.log('   - For Atlas: Check your connection string and IP whitelist');
    console.log('   - Verify your credentials are correct');
    console.log('   - Check your internet connection\n');
    process.exit(1);
  });
