const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');
const DirectoryUpload = require('./models/DirectoryUpload');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function debugBulkUpload() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Check current state
    const adminCount = await AdminDirectory.countDocuments();
    const uploadCount = await DirectoryUpload.countDocuments();
    console.log(`📊 Current AdminDirectory count: ${adminCount}`);
    console.log(`📊 Current DirectoryUpload count: ${uploadCount}`);

    // Get the latest upload batch
    const latestUpload = await DirectoryUpload.findOne().sort({ uploadDate: -1 });
    if (latestUpload) {
      console.log(`\n🔍 Latest upload batch: ${latestUpload.uploadBatch}`);
      console.log(`📁 File: ${latestUpload.originalFileName}`);
      console.log(`📊 Status: ${latestUpload.status}`);
      console.log(`✅ Successful uploads: ${latestUpload.successfulUploads}`);
      console.log(`❌ Failed uploads: ${latestUpload.failedUploads}`);
      console.log(`📝 Total rows: ${latestUpload.totalRows}`);
      
      // Check if there are any AdminDirectory entries for this batch
      const adminEntries = await AdminDirectory.find({ uploadBatch: latestUpload.uploadBatch });
      console.log(`\n🔍 AdminDirectory entries for batch ${latestUpload.uploadBatch}: ${adminEntries.length}`);
      
      if (adminEntries.length === 0) {
        console.log('❌ NO AdminDirectory entries found for this batch!');
        console.log('🚨 This confirms the data is not being saved to AdminDirectory collection');
        
        // Check if there are ANY AdminDirectory entries
        const allAdminEntries = await AdminDirectory.find();
        console.log(`📊 Total AdminDirectory entries in database: ${allAdminEntries.length}`);
        
        if (allAdminEntries.length === 0) {
          console.log('🚨 AdminDirectory collection is completely empty!');
          console.log('🔍 This suggests a systematic issue with data persistence');
        }
      } else {
        console.log('✅ AdminDirectory entries found for this batch');
        adminEntries.forEach((entry, index) => {
          console.log(`  ${index + 1}. ${entry.company} (${entry.email})`);
        });
      }
    } else {
      console.log('❌ No upload history found');
    }

    // Test creating a single AdminDirectory entry to verify the model works
    console.log('\n🧪 Testing AdminDirectory model...');
    try {
      const testEntry = new AdminDirectory({
        company: 'Debug Test Company',
        email: 'debug@test.com',
        phone: '+1-555-debug',
        industry: 'Technology',
        displayCategory: 'Project',
        uploadBatch: 'debug-test-001',
        originalFileName: 'debug-test.xlsx',
        rowNumber: 1,
        uploadedBy: 'admin'
      });
      
      await testEntry.save();
      console.log('✅ AdminDirectory model test successful');
      
      // Clean up test entry
      await AdminDirectory.deleteOne({ _id: testEntry._id });
      console.log('🧹 Test entry cleaned up');
      
    } catch (modelError) {
      console.error('❌ AdminDirectory model test failed:', modelError);
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugBulkUpload();
