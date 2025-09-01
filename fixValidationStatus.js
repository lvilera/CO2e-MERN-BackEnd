const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function fixValidationStatus() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Find all AdminDirectory entries with validationStatus 'valid' and update to 'validated'
    console.log('🔍 Finding AdminDirectory entries with validationStatus "valid"...');
    const entriesToUpdate = await AdminDirectory.find({ validationStatus: 'valid' });
    console.log(`📊 Found ${entriesToUpdate.length} entries to update`);

    if (entriesToUpdate.length > 0) {
      console.log('🔄 Updating validationStatus from "valid" to "validated"...');
      const updateResult = await AdminDirectory.updateMany(
        { validationStatus: 'valid' },
        { $set: { validationStatus: 'validated' } }
      );
      console.log(`✅ Updated ${updateResult.modifiedCount} entries successfully`);
    } else {
      console.log('ℹ️ No entries found with validationStatus "valid"');
    }

    // Also check for any entries that might have been set to 'validated' already
    const validatedCount = await AdminDirectory.countDocuments({ validationStatus: 'validated' });
    const pendingCount = await AdminDirectory.countDocuments({ validationStatus: 'pending' });
    const invalidCount = await AdminDirectory.countDocuments({ validationStatus: 'invalid' });
    
    console.log('\n📊 Current validation status counts:');
    console.log(`   - validated: ${validatedCount}`);
    console.log(`   - pending: ${pendingCount}`);
    console.log(`   - invalid: ${invalidCount}`);

    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
fixValidationStatus();
