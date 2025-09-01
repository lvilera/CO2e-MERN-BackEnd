const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function testAdminDirectory() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Check current count
    const currentCount = await AdminDirectory.countDocuments();
    console.log(`📊 Current AdminDirectory count: ${currentCount}`);

    // Clear existing test data
    await AdminDirectory.deleteMany({ uploadBatch: 'test-batch-001' });
    console.log('🧹 Cleared existing test data');

    // Create test data with proper fields
    const testEntries = [
      {
        company: 'Test Company 1',
        email: 'test1@example.com',
        phone: '+1-555-0001',
        industry: 'Technology',
        imageUrl: '',
        socialType: 'Facebook',
        socialLink: 'https://facebook.com/test1',
        package: 'free',
        address: '',
        website: '',
        description: '',
        displayCategory: 'Project',
        uploadBatch: 'test-batch-001',
        originalFileName: 'test.xlsx',
        rowNumber: 1,
        uploadedBy: 'admin',
        validationStatus: 'pending',
        validationErrors: [],
        source: 'admin'
      },
      {
        company: 'Test Company 2',
        email: 'test2@example.com',
        phone: '+1-555-0002',
        industry: 'Construction',
        imageUrl: '',
        socialType: 'LinkedIn',
        socialLink: 'https://linkedin.com/test2',
        package: 'pro',
        address: '',
        website: '',
        description: '',
        displayCategory: 'Project',
        uploadBatch: 'test-batch-001',
        originalFileName: 'test.xlsx',
        rowNumber: 2,
        uploadedBy: 'admin',
        validationStatus: 'pending',
        validationErrors: [],
        source: 'admin'
      },
      {
        company: 'Test Company 3',
        email: 'test3@example.com',
        phone: '+1-555-0003',
        industry: 'Wholesale',
        imageUrl: '',
        socialType: 'Instagram',
        socialLink: 'https://instagram.com/test3',
        package: 'premium',
        address: '',
        website: '',
        description: '',
        displayCategory: 'Wholesaler',
        uploadBatch: 'test-batch-001',
        originalFileName: 'test.xlsx',
        rowNumber: 3,
        uploadedBy: 'admin',
        validationStatus: 'pending',
        validationErrors: [],
        source: 'admin'
      },
      {
        company: 'Test Company 4',
        email: 'test4@example.com',
        phone: '+1-555-0004',
        industry: 'Retail',
        imageUrl: '',
        socialType: 'Twitter',
        socialLink: 'https://twitter.com/test4',
        package: 'free',
        address: '',
        website: '',
        description: '',
        displayCategory: 'Retail',
        uploadBatch: 'test-batch-001',
        originalFileName: 'test.xlsx',
        rowNumber: 4,
        uploadedBy: 'admin',
        validationStatus: 'pending',
        validationErrors: [],
        source: 'admin'
      }
    ];

    console.log('📝 Creating test AdminDirectory entries...');
    
    // Save each entry
    for (const entry of testEntries) {
      const adminDir = new AdminDirectory(entry);
      await adminDir.save();
      console.log(`✅ Saved: ${entry.company}`);
    }

    console.log('🎉 Test entries created successfully!');

    // Test the main directory endpoint
    console.log('🧪 Testing main directory endpoint...');
    const response = await fetch('http://localhost:5001/api/directory');
    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Main endpoint returned ${data.length} entries`);
    } else {
      console.log('❌ Main endpoint failed');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testAdminDirectory(); 