const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function debugPersistence() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('🔗 Connection string:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Check current database name
    console.log('📊 Current database:', mongoose.connection.db.databaseName);
    
    // Check current count
    const currentCount = await AdminDirectory.countDocuments();
    console.log(`📊 Current AdminDirectory count: ${currentCount}`);
    
    // Create a test entry with timestamp
    const timestamp = new Date().toISOString();
    const testEntry = new AdminDirectory({
      company: `Persistence Test ${timestamp}`,
      email: `test-${Date.now()}@example.com`,
      phone: '+1-555-persistence',
      industry: 'Technology',
      displayCategory: 'Project',
      uploadBatch: `persistence-test-${Date.now()}`,
      originalFileName: 'persistence-test.xlsx',
      rowNumber: 1,
      uploadedBy: 'admin'
    });
    
    console.log('📝 Creating test entry...');
    await testEntry.save();
    console.log('✅ Test entry saved successfully!');
    
    // Verify it was saved
    const savedEntry = await AdminDirectory.findOne({ _id: testEntry._id });
    if (savedEntry) {
      console.log('✅ Test entry verified in database');
      console.log('📝 Entry details:', {
        company: savedEntry.company,
        email: savedEntry.email,
        createdAt: savedEntry.createdAt
      });
    } else {
      console.log('❌ Test entry not found in database!');
    }
    
    // Check count again
    const newCount = await AdminDirectory.countDocuments();
    console.log(`📊 New AdminDirectory count: ${newCount}`);
    
    // Wait 5 seconds and check again
    console.log('\n⏳ Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const countAfterWait = await AdminDirectory.countDocuments();
    console.log(`📊 Count after 5 seconds: ${countAfterWait}`);
    
    if (countAfterWait < newCount) {
      console.log('🚨 DATA LOSS DETECTED! Count decreased after waiting');
    } else {
      console.log('✅ Data persisted after waiting');
    }
    
    // Disconnect
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugPersistence();
