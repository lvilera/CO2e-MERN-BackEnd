const mongoose = require('mongoose');
const UserDirectory = require('./models/UserDirectory');
const AdminDirectory = require('./models/AdminDirectory');

// MongoDB connection string
const MONGODB_URI = "mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/myDatabase?retryWrites=true&w=majority&directConnection=false";

async function populateTestData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing test data
    await UserDirectory.deleteMany({ company: { $regex: /^Test/ } });
    await AdminDirectory.deleteMany({ company: { $regex: /^Test/ } });
    console.log('🧹 Cleared existing test data');

    // Create test UserDirectory entries
    const userEntries = [
      {
        company: 'Test User Company 1',
        email: 'user1@test.com',
        phone: '123-456-7890',
        industry: 'Local Contractors',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        contractorType: 'General Contractor',
        package: 'free',
        status: 'approved',
        submissionMethod: 'form',
        userEmail: 'user1@test.com'
      },
      {
        company: 'Test User Company 2',
        email: 'user2@test.com',
        phone: '123-456-7891',
        industry: 'Retail',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        contractorType: 'Retail Store',
        package: 'pro',
        status: 'approved',
        submissionMethod: 'form',
        userEmail: 'user2@test.com'
      },
      {
        company: 'Test User Company 3',
        email: 'user3@test.com',
        phone: '123-456-7892',
        industry: 'Broker',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        contractorType: 'Real Estate Broker',
        package: 'premium',
        status: 'approved',
        submissionMethod: 'form',
        userEmail: 'user3@test.com'
      }
    ];

    // Create test AdminDirectory entries
    const adminEntries = [
      {
        company: 'Test Admin Company 1',
        email: 'admin1@test.com',
        phone: '123-456-7893',
        industry: 'Exchange',
        city: 'Miami',
        state: 'FL',
        country: 'USA',
        contractorType: 'Exchange Platform',
        package: 'free',
        validationStatus: 'validated',
        uploadBatch: 'test-batch-001',
        originalFileName: 'test-admin-upload.xlsx',
        rowNumber: 1,
        uploadedBy: 'admin'
      },
      {
        company: 'Test Admin Company 2',
        email: 'admin2@test.com',
        phone: '123-456-7894',
        industry: 'Project',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        contractorType: 'Project Management',
        package: 'pro',
        validationStatus: 'validated',
        uploadBatch: 'test-batch-001',
        originalFileName: 'test-admin-upload.xlsx',
        rowNumber: 2,
        uploadedBy: 'admin'
      },
      {
        company: 'Test Admin Company 3',
        email: 'admin3@test.com',
        phone: '123-456-7895',
        industry: 'Wholesaler',
        city: 'Denver',
        state: 'CO',
        country: 'USA',
        contractorType: 'Wholesale Distribution',
        package: 'premium',
        validationStatus: 'validated',
        uploadBatch: 'test-batch-001',
        originalFileName: 'test-admin-upload.xlsx',
        rowNumber: 3,
        uploadedBy: 'admin'
      }
    ];

    // Save user entries
    console.log('📝 Creating test UserDirectory entries...');
    const savedUserEntries = await UserDirectory.insertMany(userEntries);
    console.log(`✅ Created ${savedUserEntries.length} UserDirectory entries`);

    // Save admin entries
    console.log('📝 Creating test AdminDirectory entries...');
    const savedAdminEntries = await AdminDirectory.insertMany(adminEntries);
    console.log(`✅ Created ${savedAdminEntries.length} AdminDirectory entries`);

    // Verify the data
    const totalUserEntries = await UserDirectory.countDocuments({ status: 'approved' });
    const totalAdminEntries = await AdminDirectory.countDocuments({ validationStatus: { $in: ['validated', 'pending'] } });
    
    console.log('\n📊 Final counts:');
    console.log(`   - UserDirectory entries (approved): ${totalUserEntries}`);
    console.log(`   - AdminDirectory entries (validated/pending): ${totalAdminEntries}`);
    console.log(`   - Total entries that will show on service page: ${totalUserEntries + totalAdminEntries}`);

    console.log('\n✅ Test data populated successfully!');
    
  } catch (error) {
    console.error('❌ Error populating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the population
populateTestData();
