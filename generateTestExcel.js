const XLSX = require('xlsx');

// Test data with just a few entries for easier testing
const testData = [
  {
    'COMPANY': 'Test Construction',
    'WEBSITE': 'www.testconstruction.com',
    'CONTACT': '123 Test St, Test City, TC',
    'EMAIL': 'test@construction.com',
    'PHONE NUMBER': '+1-555-0001',
    'CATEGORY': 'Local Contractors',
    'SUB-CATEGORY2': 'General Contractor'
  },
  {
    'COMPANY': 'Test Plumbing',
    'WEBSITE': 'www.testplumbing.com',
    'CONTACT': '456 Test Ave, Test City, TC',
    'EMAIL': 'test@plumbing.com',
    'PHONE NUMBER': '+1-555-0002',
    'CATEGORY': 'Local Contractors',
    'SUB-CATEGORY2': 'Plumber'
  },
  {
    'COMPANY': 'Test Broker',
    'WEBSITE': 'www.testbroker.com',
    'CONTACT': '789 Test Rd, Test City, TC',
    'EMAIL': 'test@broker.com',
    'PHONE NUMBER': '+1-555-0003',
    'CATEGORY': 'Broker',
    'SUB-CATEGORY2': 'Test Services'
  },
  {
    'COMPANY': 'Test Exchange',
    'WEBSITE': 'www.testexchange.com',
    'CONTACT': '321 Test Blvd, Test City, TC',
    'EMAIL': 'test@exchange.com',
    'PHONE NUMBER': '+1-555-0004',
    'CATEGORY': 'Exchange',
    'SUB-CATEGORY2': 'Test Trading'
  },
  {
    'COMPANY': 'Test Project',
    'WEBSITE': 'www.testproject.com',
    'CONTACT': '654 Test Way, Test City, TC',
    'EMAIL': 'test@project.com',
    'PHONE NUMBER': '+1-555-0005',
    'CATEGORY': 'Project',
    'SUB-CATEGORY2': 'Test Development'
  }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Create a worksheet from the data
const worksheet = XLSX.utils.json_to_sheet(testData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Directory');

// Write the file
XLSX.writeFile(workbook, 'test_directory_data.xlsx');

console.log('Test Excel file generated successfully: test_directory_data.xlsx');
console.log(`Generated ${testData.length} test directory listings`);
console.log('Use this smaller file for initial testing!'); 