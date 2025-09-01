const mongoose = require('mongoose');
const DirectoryUpload = require('./models/DirectoryUpload');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function cleanupDuplicateUploads() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Get all uploads grouped by filename
    const uploads = await DirectoryUpload.find().sort({ uploadDate: -1 });
    console.log(`📊 Found ${uploads.length} total uploads`);

    // Group by filename
    const uploadsByFilename = {};
    uploads.forEach(upload => {
      if (!uploadsByFilename[upload.originalFileName]) {
        uploadsByFilename[upload.originalFileName] = [];
      }
      uploadsByFilename[upload.originalFileName].push(upload);
    });

    console.log(`📁 Found ${Object.keys(uploadsByFilename).length} unique filenames`);

    let deletedCount = 0;
    let keptCount = 0;

    for (const [filename, fileUploads] of Object.entries(uploadsByFilename)) {
      if (fileUploads.length > 1) {
        console.log(`\n🔄 Processing "${filename}" - ${fileUploads.length} uploads found`);
        
        // Sort by upload date (newest first)
        fileUploads.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        // Keep the most recent one
        const keepUpload = fileUploads[0];
        const deleteUploads = fileUploads.slice(1);
        
        console.log(`   ✅ Keeping: ${keepUpload.uploadBatch} (${new Date(keepUpload.uploadDate).toLocaleString()})`);
        
        // Delete duplicate uploads and their listings
        for (const deleteUpload of deleteUploads) {
          console.log(`   🗑️  Deleting: ${deleteUpload.uploadBatch} (${new Date(deleteUpload.uploadDate).toLocaleString()})`);
          
          // Delete listings from this batch
          const deleteResult = await AdminDirectory.deleteMany({ uploadBatch: deleteUpload.uploadBatch });
          console.log(`      📋 Deleted ${deleteResult.deletedCount} listings`);
          
          // Delete the upload entry
          await DirectoryUpload.findByIdAndDelete(deleteUpload._id);
          deletedCount++;
        }
        
        keptCount++;
      } else {
        console.log(`\n✅ "${filename}" - Only 1 upload, keeping as is`);
        keptCount++;
      }
    }
    
    console.log('\n🎉 Cleanup completed successfully!');
    console.log(`📊 Results:`);
    console.log(`   ✅ Kept: ${keptCount} unique uploads`);
    console.log(`   🗑️  Deleted: ${deletedCount} duplicate uploads`);
    
    // Show final count
    const finalUploads = await DirectoryUpload.countDocuments();
    console.log(`📊 Final upload count: ${finalUploads}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupDuplicateUploads(); 