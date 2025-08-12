const mongoose = require('mongoose');
const Directory = require('./models/Directory');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Sample local contractor data with different locations
const localContractors = [
  {
    company: "Green Thumb Landscaping",
    email: "info@greenthumb.com",
    phone: "(555) 123-4567",
    address: "123 Garden Street",
    website: "https://greenthumb.com",
    socialType: "Facebook",
    socialLink: "https://facebook.com/greenthumb",
    industry: "Local Contractors",
    description: "Professional landscaping and garden maintenance services. Specializing in sustainable design and native plants.",
    package: "premium",
    city: "New York",
    state: "New York",
    country: "USA"
  },
  {
    company: "Metro Plumbing Solutions",
    email: "service@metroplumbing.com",
    phone: "(555) 234-5678",
    address: "456 Water Avenue",
    website: "https://metroplumbing.com",
    socialType: "LinkedIn",
    socialLink: "https://linkedin.com/metroplumbing",
    industry: "Local Contractors",
    description: "24/7 emergency plumbing services. Licensed and insured professionals for all your plumbing needs.",
    package: "pro",
    city: "New York",
    state: "New York",
    country: "USA"
  },
  {
    company: "Brooklyn Electric Co.",
    email: "contact@brooklynelectric.com",
    phone: "(555) 345-6789",
    address: "789 Power Lane",
    website: "https://brooklynelectric.com",
    socialType: "Instagram",
    socialLink: "https://instagram.com/brooklynelectric",
    industry: "Local Contractors",
    description: "Residential and commercial electrical services. Expert electricians with over 15 years of experience.",
    package: "premium",
    city: "Brooklyn",
    state: "New York",
    country: "USA"
  },
  {
    company: "Queens HVAC Services",
    email: "info@queenshvac.com",
    phone: "(555) 456-7890",
    address: "321 Climate Road",
    website: "https://queenshvac.com",
    socialType: "Twitter",
    socialLink: "https://twitter.com/queenshvac",
    industry: "Local Contractors",
    description: "Heating, ventilation, and air conditioning services. Energy-efficient solutions for your home or business.",
    package: "pro",
    city: "Queens",
    state: "New York",
    country: "USA"
  },
  {
    company: "Manhattan Construction Group",
    email: "hello@manhattanconstruction.com",
    phone: "(555) 567-8901",
    address: "654 Build Street",
    website: "https://manhattanconstruction.com",
    socialType: "Facebook",
    socialLink: "https://facebook.com/manhattanconstruction",
    industry: "Local Contractors",
    description: "Full-service construction company. From renovations to new builds, we handle projects of all sizes.",
    package: "premium",
    city: "Manhattan",
    state: "New York",
    country: "USA"
  },
  {
    company: "Bronx Roofing Experts",
    email: "service@bronxroofing.com",
    phone: "(555) 678-9012",
    address: "987 Roof Terrace",
    website: "https://bronxroofing.com",
    socialType: "LinkedIn",
    socialLink: "https://linkedin.com/bronxroofing",
    industry: "Local Contractors",
    description: "Professional roofing services including repairs, replacements, and maintenance. Licensed and insured.",
    package: "pro",
    city: "Bronx",
    state: "New York",
    country: "USA"
  },
  {
    company: "Staten Island Paint Pros",
    email: "info@statenislandpaint.com",
    phone: "(555) 789-0123",
    address: "147 Color Way",
    website: "https://statenislandpaint.com",
    socialType: "Instagram",
    socialLink: "https://instagram.com/statenislandpaint",
    industry: "Local Contractors",
    description: "Interior and exterior painting services. Quality workmanship and competitive pricing.",
    package: "premium",
    city: "Staten Island",
    state: "New York",
    country: "USA"
  },
  {
    company: "Long Island Home Services",
    email: "contact@longislandhome.com",
    phone: "(555) 890-1234",
    address: "258 Home Circle",
    website: "https://longislandhome.com",
    socialType: "Facebook",
    socialLink: "https://facebook.com/longislandhome",
    industry: "Local Contractors",
    description: "Comprehensive home maintenance and repair services. Serving Long Island communities.",
    package: "pro",
    city: "Long Island",
    state: "New York",
    country: "USA"
  },
  {
    company: "Westchester Contracting",
    email: "info@westchestercontracting.com",
    phone: "(555) 901-2345",
    address: "369 Contract Lane",
    website: "https://westchestercontracting.com",
    socialType: "LinkedIn",
    socialLink: "https://linkedin.com/westchestercontracting",
    industry: "Local Contractors",
    description: "General contracting services for residential and commercial properties. Quality craftsmanship guaranteed.",
    package: "premium",
    city: "White Plains",
    state: "New York",
    country: "USA"
  },
  {
    company: "Hudson Valley Renovations",
    email: "service@hudsonvalleyrenovations.com",
    phone: "(555) 012-3456",
    address: "741 Renovation Drive",
    website: "https://hudsonvalleyrenovations.com",
    socialType: "Twitter",
    socialLink: "https://twitter.com/hudsonvalleyreno",
    industry: "Local Contractors",
    description: "Specializing in home renovations and remodeling. Transform your space with our expert team.",
    package: "pro",
    city: "Poughkeepsie",
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

// Seed the database with local contractor data
async function seedLocalContractors() {
  try {
    // Clear existing local contractors
    await Directory.deleteMany({ industry: 'Local Contractors' });
    console.log('🗑️  Cleared existing local contractors');

    // Insert new local contractors
    const result = await Directory.insertMany(localContractors);
    console.log(`✅ Successfully added ${result.length} local contractors to the database`);

    // Display the added contractors
    console.log('\n📋 Added Local Contractors:');
    result.forEach((contractor, index) => {
      console.log(`${index + 1}. ${contractor.company} - ${contractor.city}, ${contractor.state}`);
    });

  } catch (error) {
    console.error('❌ Error seeding local contractors:', error);
  }
}

// Main function
async function main() {
  await connectDB();
  await seedLocalContractors();
  
  console.log('\n🎉 Seeding completed!');
  mongoose.connection.close();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedLocalContractors }; 