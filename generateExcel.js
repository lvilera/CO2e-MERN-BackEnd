const XLSX = require('xlsx');

// Sample data matching the Directory Format.xlsm structure
const sampleData = [
  {
    'COMPANY': 'ABC Construction',
    'WEBSITE': 'www.abcconstruction.com',
    'CONTACT': '123 Main St, New York, NY',
    'EMAIL': 'abc@construction.com',
    'PHONE NUMBER': '+1-555-0101',
    'CATEGORY': 'Local Contractors',
    'SUB-CATEGORY2': 'General Contractor'
  },
  {
    'COMPANY': 'XYZ Plumbing',
    'WEBSITE': 'www.xyzplumbing.com',
    'CONTACT': '456 Oak Ave, Los Angeles, CA',
    'EMAIL': 'xyz@plumbing.com',
    'PHONE NUMBER': '+1-555-0102',
    'CATEGORY': 'Local Contractors',
    'SUB-CATEGORY2': 'Plumber'
  },
  {
    'COMPANY': 'Green Energy Solutions',
    'WEBSITE': 'www.greenenergy.com',
    'CONTACT': '789 Pine Rd, Chicago, IL',
    'EMAIL': 'green@energy.com',
    'PHONE NUMBER': '+1-555-0103',
    'CATEGORY': 'Project',
    'SUB-CATEGORY2': 'Solar Installation'
  },
  {
    'COMPANY': 'Tech Brokers Inc',
    'WEBSITE': 'www.techbrokers.com',
    'CONTACT': '321 Tech Blvd, San Francisco, CA',
    'EMAIL': 'tech@brokers.com',
    'PHONE NUMBER': '+1-555-0104',
    'CATEGORY': 'Broker',
    'SUB-CATEGORY2': 'Technology'
  },
  {
    'COMPANY': 'Global Exchange',
    'WEBSITE': 'www.globalexchange.com',
    'CONTACT': '654 Exchange St, Miami, FL',
    'EMAIL': 'global@exchange.com',
    'PHONE NUMBER': '+1-555-0105',
    'CATEGORY': 'Exchange',
    'SUB-CATEGORY2': 'International'
  },
  {
    'COMPANY': 'City Retail Store',
    'WEBSITE': 'www.cityretail.com',
    'CONTACT': '987 Retail Ave, Seattle, WA',
    'EMAIL': 'city@retail.com',
    'PHONE NUMBER': '+1-555-0106',
    'CATEGORY': 'Retail',
    'SUB-CATEGORY2': 'Electronics'
  },
  {
    'COMPANY': 'Wholesale Supplies',
    'WEBSITE': 'www.wholesalesupplies.com',
    'CONTACT': '147 Supply Rd, Dallas, TX',
    'EMAIL': 'wholesale@supplies.com',
    'PHONE NUMBER': '+1-555-0107',
    'CATEGORY': 'Wholesaler',
    'SUB-CATEGORY2': 'Construction Materials'
  },
  {
    'COMPANY': 'Elite Electricians',
    'WEBSITE': 'www.eliteelectric.com',
    'CONTACT': '258 Electric St, Boston, MA',
    'EMAIL': 'elite@electric.com',
    'PHONE NUMBER': '+1-555-0108',
    'CATEGORY': 'Local Contractors',
    'SUB-CATEGORY2': 'Electrician'
  },
  {
    'COMPANY': 'Master Carpenters',
    'WEBSITE': 'www.mastercarpenters.com',
    'CONTACT': '369 Wood Ave, Portland, OR',
    'EMAIL': 'master@carpenters.com',
    'PHONE NUMBER': '+1-555-0109',
    'CATEGORY': 'Local Contractors',
    'SUB-CATEGORY2': 'Carpenter'
  },
  {
    'COMPANY': 'Solar Projects Ltd',
    'WEBSITE': 'www.solarprojects.com',
    'CONTACT': '741 Solar Way, Denver, CO',
    'EMAIL': 'solar@projects.com',
    'PHONE NUMBER': '+1-555-0110',
    'CATEGORY': 'Project',
    'SUB-CATEGORY2': 'Renewable Energy'
  }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Create a worksheet from the data
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Directory Listings');

// Write the file
XLSX.writeFile(workbook, 'sample_directory_data.xlsx');

console.log('Excel file generated successfully: sample_directory_data.xlsx');
console.log(`Generated ${sampleData.length} sample directory listings`);
console.log('You can now use this file to test the admin directory upload functionality!'); 