const mongoose = require('mongoose');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string - using the same as the main server
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function debugUpload() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Try to create a test AdminDirectory entry
    console.log('🧪 Creating test AdminDirectory entry...');
    const testEntry = new AdminDirectory({
      company: 'Test Company',
      email: 'test@example.com',
      phone: '123-456-7890',
      industry: 'Test Industry',
      uploadBatch: 'test-batch-123',
      originalFileName: 'test.xlsx',
      rowNumber: 1,
      validationStatus: 'pending'
    });

    console.log('📝 Test entry created, attempting to save...');
    const savedEntry = await testEntry.save();
    console.log('✅ Test entry saved successfully:', savedEntry._id);

    // Check if it's actually in the database
    const foundEntry = await AdminDirectory.findById(savedEntry._id);
    console.log('🔍 Found entry in database:', foundEntry ? 'YES' : 'NO');
    
    if (foundEntry) {
      console.log('📊 Entry details:', {
        company: foundEntry.company,
        email: foundEntry.email,
        validationStatus: foundEntry.validationStatus
      });
    }

    // Clean up test entry
    await AdminDirectory.findByIdAndDelete(savedEntry._id);
    console.log('🧹 Test entry cleaned up');

    console.log('\n✅ Debug test completed!');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    console.error('Error details:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the debug test
debugUpload();
