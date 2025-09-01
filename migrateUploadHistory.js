const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');
const DirectoryUpload = require('./models/DirectoryUpload');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function migrateUploadHistory() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Get all unique batch IDs from AdminDirectory
    const batchIds = await AdminDirectory.distinct('uploadBatch');
    console.log(`📊 Found ${batchIds.length} unique upload batches:`, batchIds);

    for (const batchId of batchIds) {
      console.log(`\n🔄 Processing batch: ${batchId}`);
      
      // Get all listings for this batch
      const listings = await AdminDirectory.find({ uploadBatch: batchId });
      console.log(`   📋 Found ${listings.length} listings for batch ${batchId}`);
      
      // Get the first listing to extract file information
      const firstListing = listings[0];
      if (!firstListing) continue;
      
      // Check if this upload already exists in DirectoryUpload
      const existingUpload = await DirectoryUpload.findOne({ uploadBatch: batchId });
      if (existingUpload) {
        console.log(`   ⚠️  Upload for batch ${batchId} already exists, skipping...`);
        continue;
      }
      
      // Create upload history entry
      const uploadData = {
        originalFileName: firstListing.originalFileName || `Batch_${batchId}.xlsx`,
        fileSize: 50000, // Default size since we don't have original file size
        fileType: 'xlsx',
        uploadBatch: batchId,
        totalRows: listings.length,
        successfulUploads: listings.length,
        failedUploads: 0,
        status: 'completed',
        errors: [],
        uploadedBy: 'admin',
        processingTime: 5000, // Default processing time
        headers: ['COMPANY', 'EMAIL', 'PHONE', 'INDUSTRY', 'CATEGORY'], // Default headers
        sampleRows: listings.slice(0, 3).map(listing => ({
          company: listing.company,
          email: listing.email,
          industry: listing.industry
        }))
      };
      
      const uploadHistory = new DirectoryUpload(uploadData);
      await uploadHistory.save();
      
      console.log(`   ✅ Created upload history for batch ${batchId}`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Show final count
    const totalUploads = await DirectoryUpload.countDocuments();
    console.log(`📊 Total uploads in DirectoryUpload collection: ${totalUploads}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
migrateUploadHistory(); 