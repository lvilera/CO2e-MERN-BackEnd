const mongoose = require('mongoose');
const Directory = require('./models/Directory');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aryan:2021cs613@cluster0.o8bu9nt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Pakistan Local Contractors data
const pakistanContractors = [
  {
    company: "Lahore Construction Solutions",
    email: "info@lahoreconstruction.com",
    phone: "+92-300-123-4567",
    address: "123 Main Boulevard, Gulberg III",
    website: "https://lahoreconstruction.com",
    socialType: "Facebook",
    socialLink: "https://facebook.com/lahoreconstruction",
    industry: "Local Contractors",
    description: "Professional construction and renovation services in Lahore. Quality workmanship and competitive pricing.",
    package: "premium",
    city: "Lahore",
    state: "PB",
    country: "PK"
  },
  {
    company: "Punjab Electrical Services",
    email: "service@punjabelectrical.com",
    phone: "+92-300-234-5678",
    address: "456 Electric Avenue, Model Town",
    website: "https://punjabelectrical.com",
    socialType: "LinkedIn",
    socialLink: "https://linkedin.com/punjabelectrical",
    industry: "Local Contractors",
    description: "Licensed electrical contractors serving Lahore and surrounding areas. 24/7 emergency services available.",
    package: "pro",
    city: "Lahore",
    state: "PB",
    country: "PK"
  },
  {
    company: "Karachi Plumbing Experts",
    email: "contact@karachiplumbing.com",
    phone: "+92-300-345-6789",
    address: "789 Water Street, Defence",
    website: "https://karachiplumbing.com",
    socialType: "Instagram",
    socialLink: "https://instagram.com/karachiplumbing",
    industry: "Local Contractors",
    description: "Professional plumbing services in Karachi. From repairs to installations, we handle it all.",
    package: "premium",
    city: "Karachi",
    state: "SD",
    country: "PK"
  },
  {
    company: "Islamabad Home Renovations",
    email: "info@islamabadrenovations.com",
    phone: "+92-300-456-7890",
    address: "321 Renovation Road, F-7",
    website: "https://islamabadrenovations.com",
    socialType: "Twitter",
    socialLink: "https://twitter.com/islamabadreno",
    industry: "Local Contractors",
    description: "Home renovation and remodeling services in Islamabad. Transform your space with our expert team.",
    package: "pro",
    city: "Islamabad",
    state: "ICT",
    country: "PK"
  },
  {
    company: "Peshawar Construction Co.",
    email: "service@peshawarconstruction.com",
    phone: "+92-300-567-8901",
    address: "654 Build Street, University Town",
    website: "https://peshawarconstruction.com",
    socialType: "Facebook",
    socialLink: "https://facebook.com/peshawarconstruction",
    industry: "Local Contractors",
    description: "General contracting services in Peshawar. Residential and commercial projects of all sizes.",
    package: "premium",
    city: "Peshawar",
    state: "KP",
    country: "PK"
  },
  {
    company: "Multan Roofing Specialists",
    email: "info@multanroofing.com",
    phone: "+92-300-678-9012",
    address: "987 Roof Terrace, Ghanta Ghar",
    website: "https://multanroofing.com",
    socialType: "LinkedIn",
    socialLink: "https://linkedin.com/multanroofing",
    industry: "Local Contractors",
    description: "Professional roofing services in Multan. Repairs, replacements, and maintenance for all roof types.",
    package: "pro",
    city: "Multan",
    state: "PB",
    country: "PK"
  },
  {
    company: "Faisalabad Paint Pros",
    email: "contact@faisalabadpaint.com",
    phone: "+92-300-789-0123",
    address: "147 Color Way, D Ground",
    website: "https://faisalabadpaint.com",
    socialType: "Instagram",
    socialLink: "https://instagram.com/faisalabadpaint",
    industry: "Local Contractors",
    description: "Interior and exterior painting services in Faisalabad. Quality workmanship and competitive pricing.",
    package: "premium",
    city: "Faisalabad",
    state: "PB",
    country: "PK"
  },
  {
    company: "Rawalpindi Home Services",
    email: "info@rawalpindihome.com",
    phone: "+92-300-890-1234",
    address: "258 Home Circle, Saddar",
    website: "https://rawalpindihome.com",
    socialType: "Facebook",
    socialLink: "https://facebook.com/rawalpindihome",
    industry: "Local Contractors",
    description: "Comprehensive home maintenance and repair services in Rawalpindi. Serving the local community.",
    package: "pro",
    city: "Rawalpindi",
    state: "PB",
    country: "PK"
  },
  {
    company: "Gujranwala Contracting",
    email: "service@gujranwalacontracting.com",
    phone: "+92-300-901-2345",
    address: "369 Contract Lane, Model Town",
    website: "https://gujranwalacontracting.com",
    socialType: "LinkedIn",
    socialLink: "https://linkedin.com/gujranwalacontracting",
    industry: "Local Contractors",
    description: "General contracting services in Gujranwala. Quality craftsmanship and reliable service.",
    package: "premium",
    city: "Gujranwala",
    state: "PB",
    country: "PK"
  },
  {
    company: "Sialkot Renovation Experts",
    email: "info@sialkotrenovation.com",
    phone: "+92-300-012-3456",
    address: "741 Renovation Drive, Cantt",
    website: "https://sialkotrenovation.com",
    socialType: "Twitter",
    socialLink: "https://twitter.com/sialkotreno",
    industry: "Local Contractors",
    description: "Specializing in home renovations and remodeling in Sialkot. Transform your space with our expert team.",
    package: "pro",
    city: "Sialkot",
    state: "PB",
    country: "PK"
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

// Seed the database with Pakistan contractor data
async function seedPakistanContractors() {
  try {
    // Clear existing local contractors
    await Directory.deleteMany({ industry: 'Local Contractors' });
    console.log('🗑️  Cleared existing local contractors');

    // Insert new Pakistan contractors
    const result = await Directory.insertMany(pakistanContractors);
    console.log(`✅ Successfully added ${result.length} Pakistan contractors to the database`);

    // Display the added contractors
    console.log('\n📋 Added Pakistan Local Contractors:');
    result.forEach((contractor, index) => {
      console.log(`${index + 1}. ${contractor.company} - ${contractor.city}, ${contractor.state}, ${contractor.country}`);
    });

  } catch (error) {
    console.error('❌ Error seeding Pakistan contractors:', error);
  }
}

// Main function
async function main() {
  await connectDB();
  await seedPakistanContractors();
  
  console.log('\n🎉 Pakistan contractors seeding completed!');
  mongoose.connection.close();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedPakistanContractors }; 