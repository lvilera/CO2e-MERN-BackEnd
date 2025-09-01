const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function testBulkUpload() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Simulate the exact data structure from the bulk upload
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
      uploadBatch: 'test-batch-456',
      originalFileName: 'test.xlsx',
      sheetName: 'Test Sheet',
      rowNumber: 1,
      uploadedBy: 'admin',
      originalData: { COMPANY: 'Test Company', EMAIL: 'test@example.com' },
      validationStatus: 'pending',
      createdAt: new Date()
    };

    console.log('🧪 Testing AdminDirectory creation with bulk upload data structure...');
    console.log('📝 Data to save:', testData);

    // Create and save the entry
    const adminDirectory = new AdminDirectory(testData);
    console.log('📝 AdminDirectory object created, attempting to save...');
    
    const savedEntry = await adminDirectory.save();
    console.log('✅ AdminDirectory saved successfully:', savedEntry._id);

    // Verify it was saved
    const foundEntry = await AdminDirectory.findById(savedEntry._id);
    console.log('�� Verification - Entry found:', foundEntry ? 'YES' : 'NO');
    
    if (foundEntry) {
      console.log('📊 Saved entry details:', {
        company: foundEntry.company,
        email: foundEntry.email,
        industry: foundEntry.industry,
        validationStatus: foundEntry.validationStatus,
        uploadBatch: foundEntry.uploadBatch
      });
    }

    // Clean up
    await AdminDirectory.findByIdAndDelete(savedEntry._id);
    console.log('🧹 Test entry cleaned up');

    console.log('\n✅ Bulk upload test completed successfully!');
    
  } catch (error) {
    console.error('❌ Bulk upload test failed:', error);
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

// Run the test
testBulkUpload();
