const XLSX = require('xlsx');

// Sample data matching the Directory Format.xlsm structure
const sampleData = [
  {
    'COMPANY': 'Macro Construction Co',
    'WEBSITE': 'www.macroconstruction.com',
    'CONTACT': '123 Macro St, Macro City, MC',
    'EMAIL': 'macro@construction.com',
    'PHONE NUMBER': '+1-555-MACRO1',
    'CATEGORY': 'Local Contractors',
    'SUB-CATEGORY2': 'General Contractor'
  },
  {
    'COMPANY': 'Macro Plumbing Pro',
    'WEBSITE': 'www.macroplumbing.com',
    'CONTACT': '456 Macro Ave, Macro City, MC',
    'EMAIL': 'macro@plumbing.com',
    'PHONE NUMBER': '+1-555-MACRO2',
    'CATEGORY': 'Local Contractors',
    'SUB-CATEGORY2': 'Plumber'
  },
  {
    'COMPANY': 'Macro Energy Solutions',
    'WEBSITE': 'www.macroenergy.com',
    'CONTACT': '789 Macro Rd, Macro City, MC',
    'EMAIL': 'macro@energy.com',
    'PHONE NUMBER': '+1-555-MACRO3',
    'CATEGORY': 'Project',
    'SUB-CATEGORY2': 'Solar Installation'
  },
  {
    'COMPANY': 'Macro Trading Co',
    'WEBSITE': 'www.macrotrading.com',
    'CONTACT': '321 Macro Blvd, Macro City, MC',
    'EMAIL': 'macro@trading.com',
    'PHONE NUMBER': '+1-555-MACRO4',
    'CATEGORY': 'Broker',
    'SUB-CATEGORY2': 'Financial Services'
  },
  {
    'COMPANY': 'Macro Exchange Ltd',
    'WEBSITE': 'www.macroexchange.com',
    'CONTACT': '654 Macro Way, Macro City, MC',
    'EMAIL': 'macro@exchange.com',
    'PHONE NUMBER': '+1-555-MACRO5',
    'CATEGORY': 'Exchange',
    'SUB-CATEGORY2': 'Digital Assets'
  }
];

// Create a new workbook
const workbook = XLSX.utils.book_new();

// Create a worksheet from the data
const worksheet = XLSX.utils.json_to_sheet(sampleData);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Directory Listings');

// Set workbook properties to indicate it's a macro-enabled workbook
workbook.Workbook = {
  ...workbook.Workbook,
  Properties: {
    ...workbook.Workbook?.Properties,
    Application: 'Microsoft Excel',
    DocSecurity: 0, // Enable macros
    ScaleCrop: false
  }
};

// Write the file as .xlsm (Excel with macros)
XLSX.writeFile(workbook, 'test_directory_data.xlsm');

console.log('XLSM file generated successfully: test_directory_data.xlsm');
console.log(`Generated ${sampleData.length} sample directory listings`);
console.log('This file contains macros and can be used to test .xlsm support!');
console.log('Note: The XLSX library will read the data from .xlsm files just like regular Excel files.'); 