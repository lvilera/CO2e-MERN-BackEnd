const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function testUpload() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Check current count
    const currentCount = await AdminDirectory.countDocuments();
    console.log(`📊 Current AdminDirectory count: ${currentCount}`);

    // Create a test entry manually
    const testEntry = new AdminDirectory({
      company: 'Manual Test Company',
      email: 'manual@test.com',
      phone: '+1-555-9999',
      industry: 'Technology',
      imageUrl: '',
      socialType: 'Facebook',
      socialLink: 'https://facebook.com/manualtest',
      package: 'free',
      address: '123 Test St',
      website: 'https://manualtest.com',
      description: 'Manual test entry',
      displayCategory: 'Project',
      uploadBatch: 'manual-test-001',
      originalFileName: 'manual-test.xlsx',
      sheetName: 'Test Sheet',
      rowNumber: 1,
      uploadedBy: 'admin',
      validationStatus: 'pending',
      validationErrors: [],
      originalData: { COMPANY: 'Manual Test Company', EMAIL: 'manual@test.com' }
    });

    console.log('📝 Saving manual test entry...');
    await testEntry.save();
    console.log('✅ Manual test entry saved successfully!');

    // Check count again
    const newCount = await AdminDirectory.countDocuments();
    console.log(`📊 New AdminDirectory count: ${newCount}`);

    // Verify the entry exists
    const savedEntry = await AdminDirectory.findOne({ company: 'Manual Test Company' });
    if (savedEntry) {
      console.log('🔍 Found saved entry:', {
        company: savedEntry.company,
        email: savedEntry.email,
        displayCategory: savedEntry.displayCategory,
        industry: savedEntry.industry
      });
    } else {
      console.log('❌ Saved entry not found!');
    }

    // Test the main directory endpoint
    console.log('🧪 Testing main directory endpoint...');
    const response = await fetch('http://localhost:5001/api/directory');
    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Main endpoint returned ${data.length} entries`);
      if (data.length > 0) {
        console.log('📝 First entry:', {
          company: data[0].company,
          email: data[0].email,
          displayCategory: data[0].displayCategory
        });
      }
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

testUpload(); 