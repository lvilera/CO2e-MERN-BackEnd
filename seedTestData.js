const mongoose = require('mongoose');
const Directory = require('./models/Directory');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Additional test data with different package types
const testData = [
  {
    company: "Free Test Company",
    email: "free@testcompany.com",
    phone: "(555) 111-1111",
    address: "123 Test Street",
    website: "https://freetest.com",
    socialType: "Facebook",
    socialLink: "https://facebook.com/freetest",
    industry: "Retail",
    description: "A free test company to test button styling",
    package: "free",
    city: "New York",
    state: "New York",
    country: "USA"
  },
  {
    company: "Pro Test Company",
    email: "pro@testcompany.com",
    phone: "(555) 222-2222",
    address: "456 Pro Street",
    website: "https://protest.com",
    socialType: "LinkedIn",
    socialLink: "https://linkedin.com/protest",
    industry: "Wholesaler",
    description: "A pro test company to test button styling",
    package: "pro",
    city: "Brooklyn",
    state: "New York",
    country: "USA"
  },
  {
    company: "Premium Test Company",
    email: "premium@testcompany.com",
    phone: "(555) 333-3333",
    address: "789 Premium Street",
    website: "https://premiumtest.com",
    socialType: "Instagram",
    socialLink: "https://instagram.com/premiumtest",
    industry: "Broker",
    description: "A premium test company to test button styling",
    package: "premium",
    city: "Queens",
    state: "New York",
    country: "USA"
  },
  {
    company: "No Package Company",
    email: "nopackage@testcompany.com",
    phone: "(555) 444-4444",
    address: "321 No Package Street",
    website: "https://nopackagetest.com",
    socialType: "Twitter",
    socialLink: "https://twitter.com/nopackagetest",
    industry: "Exchange",
    description: "A company with no package specified to test button styling",
    city: "Manhattan",
    state: "New York",
    country: "USA"
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Seed the database with test data
async function seedTestData() {
  try {
    // Clear existing test companies
    await Directory.deleteMany({ 
      email: { 
        $in: testData.map(item => item.email) 
      } 
    });
    console.log('🗑️  Cleared existing test companies');

    // Insert new test data
    const result = await Directory.insertMany(testData);
    console.log(`✅ Successfully added ${result.length} test companies to the database`);

    // Display the added companies
    console.log('\n📋 Added Test Companies:');
    result.forEach((company, index) => {
      console.log(`${index + 1}. ${company.company} - ${company.package || 'No Package'} - ${company.industry}`);
    });

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  }
}

// Main function
async function main() {
  await connectDB();
  await seedTestData();
  
  console.log('\n🎉 Test data seeding completed!');
  mongoose.connection.close();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedTestData }; 