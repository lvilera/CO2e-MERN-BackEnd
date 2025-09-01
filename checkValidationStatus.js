const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function checkValidationStatus() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Check all possible validation statuses
    const pendingCount = await AdminDirectory.countDocuments({ validationStatus: 'pending' });
    const validatedCount = await AdminDirectory.countDocuments({ validationStatus: 'validated' });
    const validCount = await AdminDirectory.countDocuments({ validationStatus: 'valid' });
    const invalidCount = await AdminDirectory.countDocuments({ validationStatus: 'invalid' });
    const allCount = await AdminDirectory.countDocuments();

    console.log('📊 Validation status counts:');
    console.log(`   - pending: ${pendingCount}`);
    console.log(`   - validated: ${validatedCount}`);
    console.log(`   - valid: ${validCount}`);
    console.log(`   - invalid: ${invalidCount}`);
    console.log(`   - total: ${allCount}`);

    // Check what the API query is actually finding
    const apiQuery = { validationStatus: { $in: ['validated', 'pending'] } };
    const apiResults = await AdminDirectory.find(apiQuery);
    console.log(`📊 API query results: ${apiResults.length} entries`);

    // Show sample entries if any exist
    if (allCount > 0) {
      const sampleEntry = await AdminDirectory.findOne();
      console.log('Sample entry:', {
        company: sampleEntry.company,
        email: sampleEntry.email,
        validationStatus: sampleEntry.validationStatus,
        uploadBatch: sampleEntry.uploadBatch
      });
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
checkValidationStatus();
