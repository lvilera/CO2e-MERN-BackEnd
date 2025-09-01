const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function debugBulkUploadProcess() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Simulate the exact bulk upload process with error handling
    const testData = {
      company: 'Test Company',
      email: 'test@example.com',
      phone: '123-456-7890',
      address: 'Test Address',
      website: 'https://test.com',
      socialType: 'facebook',
      socialLink: 'https://facebook.com/test',
      imageUrl: 'https://example.com/image.jpg',
      package: 'free',
      industry: 'Test Industry',
      displayCategory: 'Test Category',
      description: 'Test Description',
      city: '',
      state: '',
      country: '',
      contractorType: '',
      customContractorType: '',
      uploadBatch: 'debug-batch-789',
      originalFileName: 'debug.xlsx',
      sheetName: 'Debug Sheet',
      rowNumber: 1,
      uploadedBy: 'admin',
      originalData: { COMPANY: 'Test Company', EMAIL: 'test@example.com' },
      validationStatus: 'pending',
      createdAt: new Date()
    };

    console.log('🧪 Testing bulk upload process with detailed error handling...');
    
    let uploadedCount = 0;
    let errors = [];
    let results = [];

    try {
      console.log('📝 Creating AdminDirectory entry...');
      const adminDirectory = new AdminDirectory(testData);
      console.log('📝 AdminDirectory object created, attempting to save...');
      
      await adminDirectory.save();
      console.log('✅ AdminDirectory saved successfully!');
      
      results.push({
        row: 1,
        sheet: 'Debug Sheet',
        company: testData.company,
        email: testData.email,
        status: 'success',
        batchId: testData.uploadBatch
      });
      
      uploadedCount++;
      console.log('Row 1 processed successfully. Total uploaded:', uploadedCount);

    } catch (error) {
      console.error('❌ ERROR processing row 1:', error);
      console.error('Error stack:', error.stack);
      errors.push({
        row: 1,
        sheet: 'Debug Sheet',
        error: error.message,
        data: testData
      });
    }

    console.log('=== PROCESSING COMPLETED ===');
    console.log('Final results - Uploaded:', uploadedCount, 'Errors:', errors.length);

    // Verify the entry was actually saved
    const savedEntry = await AdminDirectory.findOne({ uploadBatch: testData.uploadBatch });
    console.log('🔍 Verification - Entry found in database:', savedEntry ? 'YES' : 'NO');
    
    if (savedEntry) {
      console.log('📊 Saved entry details:', {
        company: savedEntry.company,
        email: savedEntry.email,
        industry: savedEntry.industry,
        validationStatus: savedEntry.validationStatus,
        uploadBatch: savedEntry.uploadBatch
      });
    }

    // Clean up
    if (savedEntry) {
      await AdminDirectory.findByIdAndDelete(savedEntry._id);
      console.log('🧹 Test entry cleaned up');
    }

    console.log('\n✅ Debug test completed!');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the debug test
debugBulkUploadProcess();
