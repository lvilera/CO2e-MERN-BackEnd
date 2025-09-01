const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');
const UserDirectory = require('./models/UserDirectory');
const DirectoryUpload = require('./models/DirectoryUpload');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function checkDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Check AdminDirectory collection
    const adminCount = await AdminDirectory.countDocuments();
    console.log(`📊 AdminDirectory entries: ${adminCount}`);
    
    if (adminCount > 0) {
      const sampleAdmin = await AdminDirectory.findOne();
      console.log('Sample AdminDirectory entry:', {
        company: sampleAdmin.company,
        email: sampleAdmin.email,
        validationStatus: sampleAdmin.validationStatus,
        uploadBatch: sampleAdmin.uploadBatch
      });
    }

    // Check UserDirectory collection
    const userCount = await UserDirectory.countDocuments();
    console.log(`📊 UserDirectory entries: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await UserDirectory.findOne();
      console.log('Sample UserDirectory entry:', {
        company: sampleUser.company,
        email: sampleUser.email,
        status: sampleUser.status
      });
    }

    // Check DirectoryUpload collection
    const uploadCount = await DirectoryUpload.countDocuments();
    console.log(`📊 DirectoryUpload entries: ${uploadCount}`);
    
    if (uploadCount > 0) {
      const uploads = await DirectoryUpload.find().sort({ uploadDate: -1 }).limit(3);
      console.log('Recent uploads:');
      uploads.forEach((upload, index) => {
        console.log(`  ${index + 1}. ${upload.originalFileName} (${upload.uploadBatch}) - ${upload.successfulUploads} successful`);
      });
    }

    console.log('\n✅ Database check completed!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkDatabase();
