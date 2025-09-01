const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');
const DirectoryUpload = require('./models/DirectoryUpload');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function checkRecentUploads() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Get the latest upload batch
    const latestUpload = await DirectoryUpload.findOne().sort({ uploadDate: -1 });
    if (!latestUpload) {
      console.log('❌ No upload history found');
      return;
    }

    console.log(`🔍 Checking upload batch: ${latestUpload.uploadBatch}`);
    console.log(`📁 File: ${latestUpload.originalFileName}`);
    console.log(`📊 Reported successful uploads: ${latestUpload.successfulUploads}`);

    // Check if there are any AdminDirectory entries for this batch
    const adminEntries = await AdminDirectory.find({ uploadBatch: latestUpload.uploadBatch });
    console.log(`📊 Actual AdminDirectory entries for this batch: ${adminEntries.length}`);

    if (adminEntries.length > 0) {
      console.log('Sample entries:');
      adminEntries.slice(0, 3).forEach((entry, index) => {
        console.log(`  ${index + 1}. ${entry.company} (${entry.email}) - ${entry.validationStatus}`);
      });
    } else {
      console.log('❌ No AdminDirectory entries found for this batch!');
      
      // Check if there are any AdminDirectory entries at all
      const totalAdminEntries = await AdminDirectory.countDocuments();
      console.log(`📊 Total AdminDirectory entries in database: ${totalAdminEntries}`);
      
      if (totalAdminEntries > 0) {
        const sampleEntry = await AdminDirectory.findOne();
        console.log('Sample AdminDirectory entry:', {
          company: sampleEntry.company,
          email: sampleEntry.email,
          uploadBatch: sampleEntry.uploadBatch,
          validationStatus: sampleEntry.validationStatus
        });
      }
    }

    console.log('\n✅ Check completed!');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkRecentUploads();
