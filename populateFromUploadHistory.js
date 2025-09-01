const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');
const DirectoryUpload = require('./models/DirectoryUpload');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function populateFromUploadHistory() {
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

    console.log(`🔍 Processing latest upload batch: ${latestUpload.uploadBatch}`);
    console.log(`📁 File: ${latestUpload.originalFileName}`);
    console.log(`📊 Sample rows: ${latestUpload.sampleRows.length}`);

    // Clear any existing data from this batch first
    await AdminDirectory.deleteMany({ uploadBatch: latestUpload.uploadBatch });
    console.log('🧹 Cleared existing data from this batch');

    // Create AdminDirectory entries from the sample data
    console.log('\n📝 Creating AdminDirectory entries from sample data...');
    
    let createdCount = 0;
    for (let i = 0; i < latestUpload.sampleRows.length; i++) {
      const row = latestUpload.sampleRows[i];
      
      try {
        // Map the sample row data to AdminDirectory format
        const adminEntry = new AdminDirectory({
          company: row.COMPANY || 'Sample Company ' + (i + 1),
          email: row['EMAIL '] || row.EMAIL || `sample${i + 1}@example.com`,
          phone: row['PHONE NUMBER'] || '+1-555-000' + (i + 1),
          industry: row.CATEGORY || 'Technology',
          displayCategory: row.CATEGORY === 'Construction' ? 'Project' : 
                          row.CATEGORY === 'Retail' ? 'Retail' : 'Project',
          imageUrl: row.Images || '',
          socialType: row['SOCIAL MEDIA'] || 'Facebook',
          socialLink: row.LINK || 'https://example.com',
          package: row.USER || 'free',
          address: '',
          website: '',
          description: row['SUB-CATEGORY2'] || '',
          uploadBatch: latestUpload.uploadBatch,
          originalFileName: latestUpload.originalFileName,
          sheetName: row._sheet || 'Unknown',
          rowNumber: i + 1,
          uploadedBy: 'admin',
          validationStatus: 'pending',
          validationErrors: [],
          originalData: row
        });

        await adminEntry.save();
        createdCount++;
        console.log(`✅ Created entry ${i + 1}: ${adminEntry.company}`);
        
      } catch (error) {
        console.error(`❌ Error creating entry ${i + 1}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully created ${createdCount} AdminDirectory entries`);
    
    // Verify the entries were created
    const totalCount = await AdminDirectory.countDocuments();
    console.log(`📊 Total AdminDirectory entries now: ${totalCount}`);

    // Test the main directory endpoint
    console.log('\n🧪 Testing main directory endpoint...');
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
    console.log('\n🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

populateFromUploadHistory();
