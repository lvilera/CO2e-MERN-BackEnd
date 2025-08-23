const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const { cloudinary } = require('../cloudinary');
const Directory = require('../models/Directory');
const UploadedFile = require('../models/UploadedFile');
const FeaturedListing = require('../models/FeaturedListing');
const { getUserLocation } = require('../services/geolocationService');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST: Add a directory listing
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { company, email, phone, address, website, socialType, socialLink, industry, description, userPackage, city, state, country, contractorType, customContractorType } = req.body;
    // Check if a listing already exists for this email
    const existing = await Directory.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'You have already filled the form.' });
    }
    let imageUrl = '';
    if (userPackage === 'premium' && req.file) {
      // Upload image to cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'directory_logos',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });
      imageUrl = result.secure_url;
      // Also save to FeaturedListing
      await new FeaturedListing({ imageUrl }).save();
    }
    const directory = new Directory({
      company,
      email,
      phone,
      address,
      website, // keep for backward compatibility
      socialType,
      socialLink,
      industry,
      description,
      imageUrl,
      package: userPackage,
      city,
      state,
      country,
      contractorType,
      customContractorType,
    });
    await directory.save();
    res.status(201).json(directory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: All directory listings
router.get('/', async (req, res) => {
  try {
    // Add CORS headers specifically for iPhone Safari
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests for iPhone Safari
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // For iPhone Safari, allow access without authentication for directory listings
    const userAgent = req.headers['user-agent'] || '';
    const isIPhone = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    if (isIPhone && isSafari) {
      console.log('iPhone Safari detected - allowing directory access without authentication');
      // Return listings immediately without any authentication check
      const listings = await Directory.find().sort({ createdAt: -1 });
      return res.json(listings);
    }
    
    const listings = await Directory.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Directory listings by location (for Local Contractors search)
router.get('/local/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const { state, country } = req.query;
    
    let query = { city: { $regex: new RegExp(city, 'i') } };
    
    // Add state and country filters if provided
    if (state) {
      query.state = { $regex: new RegExp(state, 'i') };
    }
    if (country) {
      query.country = { $regex: new RegExp(country, 'i') };
    }
    
    const localContractors = await Directory.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      city,
      state: state || 'Any',
      country: country || 'Any',
      count: localContractors.length,
      contractors: localContractors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Directory listings by user's current location
router.get('/nearby', async (req, res) => {
  try {
    // Get user's location from IP
    const userLocation = await getUserLocation(req);
    
    if (!userLocation.city || userLocation.city === 'Unknown') {
      return res.status(400).json({ 
        error: 'Unable to determine your location. Please search by city name instead.',
        userLocation
      });
    }
    
    // Find contractors in the same city
    const nearbyContractors = await Directory.find({
      city: { $regex: new RegExp(userLocation.city, 'i') }
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      userLocation,
      count: nearbyContractors.length,
      contractors: nearbyContractors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Search contractors by industry and location
router.get('/search', async (req, res) => {
  try {
    const { industry, city, state, country } = req.query;
    
    let query = {};
    
    // Add filters if provided
    if (industry) {
      query.industry = { $regex: new RegExp(industry, 'i') };
    }
    if (city) {
      query.city = { $regex: new RegExp(city, 'i') };
    }
    if (state) {
      query.state = { $regex: new RegExp(state, 'i') };
    }
    if (country) {
      query.country = { $regex: new RegExp(country, 'i') };
    }
    
    const results = await Directory.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      filters: { industry, city, state, country },
      count: results.length,
      contractors: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Unique categories from directory listings
router.get('/categories', async (req, res) => {
  try {
    // Add CORS headers for iPhone Safari
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const categories = await Directory.distinct('industry');
    res.json(categories.filter(category => category && category.trim() !== ''));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Unique cities from directory listings
router.get('/cities', async (req, res) => {
  try {
    const cities = await Directory.distinct('city');
    res.json(cities.filter(city => city && city.trim() !== '').sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Unique contractor types from directory listings
router.get('/contractor-types', async (req, res) => {
  try {
    // Get all Local Contractors listings (check both industry and displayCategory)
    const localContractors = await Directory.find({ 
      $or: [
        { industry: 'Local Contractors' },
        { displayCategory: 'Local Contractors' }
      ]
    }, 'contractorType customContractorType description');
    
    // Extract the actual contractor types
    const contractorTypes = new Set();
    
    localContractors.forEach(contractor => {
      if (contractor.contractorType && contractor.contractorType.trim() !== '') {
        // If contractorType is "other", use customContractorType instead
        if (contractor.contractorType.toLowerCase() === 'other' || contractor.contractorType.toLowerCase() === 'other_option') {
          if (contractor.customContractorType && contractor.customContractorType.trim() !== '') {
            contractorTypes.add(contractor.customContractorType.trim());
          }
        } else {
          contractorTypes.add(contractor.contractorType.trim());
        }
      } else if (contractor.customContractorType && contractor.customContractorType.trim() !== '') {
        // Also include direct custom contractor types
        contractorTypes.add(contractor.customContractorType.trim());
      }
    });
    
    // Convert to sorted array
    const uniqueTypes = Array.from(contractorTypes).sort();
    
    console.log('Contractor types found:', uniqueTypes);
    res.json(uniqueTypes);
  } catch (err) {
    console.error('Error fetching contractor types:', err);
    res.status(500).json({ error: err.message });
  }
});

// Special route for iPhone Safari directory access
router.get('/iphone-access', async (req, res) => {
  try {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const listings = await Directory.find().sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      listings,
      message: 'iPhone Safari access granted'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint to show IP detection
router.get('/debug-ip', async (req, res) => {
  try {
    const { getUserLocation, getClientIP } = require('../services/geolocationService');
    
    const detectedIP = getClientIP(req);
    const userLocation = getUserLocation(req);
    
    // Add more detailed IP detection for Vercel
    const allHeaders = {};
    Object.keys(req.headers).forEach(key => {
      if (key.toLowerCase().includes('ip') || key.toLowerCase().includes('forward') || key.toLowerCase().includes('real')) {
        allHeaders[key] = req.headers[key];
      }
    });
    
    res.json({
      success: true,
      debug: {
        detectedIP,
        userLocation,
        allIPHeaders: allHeaders,
        fullHeaders: req.headers,
        connection: {
          remoteAddress: req.connection?.remoteAddress,
          socketRemote: req.socket?.remoteAddress
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Test file parsing (for debugging)
router.post('/test-parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const fileExtension = fileName.split('.').pop().toLowerCase();
    
    let data = [];
    let sheetInfo = []; // Initialize sheetInfo for all file types
    
    // Parse file based on extension
    if (fileExtension === 'csv') {
      // Parse CSV
      const csvData = fileBuffer.toString();
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // For CSV, create a single sheet info
      sheetInfo.push({
        name: 'CSV Data',
        rows: lines.length - 1, // Exclude header
        headers: headers
      });
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          let row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }
      }
    } else if (['xlsx', 'xls', 'xlsm'].includes(fileExtension)) {
      // Parse Excel
      let workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      console.log(`Test parse - Available sheets: ${workbook.SheetNames.join(', ')}`);
      
      // Process all sheets/tabs
      for (let sheetName of workbook.SheetNames) {
        let worksheet = workbook.Sheets[sheetName];
        let sheetData = XLSX.utils.sheet_to_json(worksheet);
        
        sheetInfo.push({
          name: sheetName,
          rows: sheetData.length,
          headers: sheetData.length > 0 ? Object.keys(sheetData[0]) : []
        });
        
        // Add sheet name to each row for debugging
        sheetData.forEach(row => {
          row._sheet = sheetName;
          data.push(row);
        });
      }
      
      console.log(`Test parse - Total rows across all sheets: ${data.length}`);
      
      // Show auto-categorization mapping
      let tabToIndustry = {
        'Brokers': 'Broker',
        'Exchange': 'Exchange', 
        'Project Type': 'Project',
        'Retail': 'Retail',
        'Wholesalers': 'Wholesaler',
        'Local Contractor': 'Local Contractors'
      };
      
      console.log('Auto-categorization mapping:');
      Object.entries(tabToIndustry).forEach(([tab, industry]) => {
        console.log(`  ${tab} → ${industry}`);
      });
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    res.json({
      success: true,
      fileName,
      fileExtension,
      totalRows: data.length,
      sheets: sheetInfo,
      headers: data.length > 0 ? Object.keys(data[0]) : [],
      firstRow: data[0] || {},
      firstThreeRows: data.slice(0, 3),
      autoCategorization: {
        'Brokers': 'Broker',
        'Exchange': 'Exchange', 
        'Project Type': 'Project',
        'Retail': 'Retail',
        'Wholesalers': 'Wholesaler',
        'Local Contractor': 'Local Contractors'
      }
    });

  } catch (err) {
    console.error('Test parse error:', err);
    res.status(500).json({ 
      error: 'Failed to parse file',
      details: err.message 
    });
  }
});

// POST: Bulk upload directory listings from Excel/CSV file
router.post('/bulk-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Use var instead of let/const to avoid any variable redeclaration issues
    var fileBuffer = req.file.buffer;
    var fileName = req.file.originalname;
    var fileExtension = fileName.split('.').pop().toLowerCase();
    var data = [];
    
    // Parse file based on extension
    if (fileExtension === 'csv') {
      // Parse CSV
      var csvData = fileBuffer.toString();
      var lines = csvData.split('\n');
      var headers = lines[0].split(',').map(function(h) { return h.trim().replace(/"/g, ''); });
      
      for (var i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          var values = lines[i].split(',').map(function(v) { return v.trim().replace(/"/g, ''); });
          var row = {};
          headers.forEach(function(header, index) {
            row[header] = values[index] || '';
          });
          data.push(row);
        }
      }
    } else if (['xlsx', 'xls', 'xlsm'].includes(fileExtension)) {
      // Parse Excel (including .xlsm files with macros)
      var workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      console.log('Excel file detected. Available sheets: ' + workbook.SheetNames.join(', '));
      
      // Process all sheets/tabs
      data = [];
      for (var sheetIndex = 0; sheetIndex < workbook.SheetNames.length; sheetIndex++) {
        var sheetName = workbook.SheetNames[sheetIndex];
        var worksheet = workbook.Sheets[sheetName];
        var sheetData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Processing sheet: ' + sheetName + ', Rows: ' + sheetData.length);
        
        // Add sheet name to each row for debugging
        for (var rowIndex = 0; rowIndex < sheetData.length; rowIndex++) {
          sheetData[rowIndex]._sheet = sheetName;
          data.push(sheetData[rowIndex]);
        }
      }
      
      console.log('Total rows across all sheets: ' + data.length);
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload Excel (.xlsx, .xls, .xlsm) or CSV files.' });
    }

    if (data.length === 0) {
      return res.status(400).json({ error: 'No data found in the uploaded file' });
    }

    // Debug: Log the first few rows to see what we're getting
    console.log('First row data:', data[0]);
    console.log('Available columns:', Object.keys(data[0] || {}));
    console.log('Total rows to process:', data.length);

    // Process each row and create directory entries
    var results = [];
    var errors = [];
    var uploadedCount = 0;

    // Tab to industry mapping
    var tabToIndustry = {
      'Brokers': 'Broker',
      'Exchange': 'Exchange', 
      'Project Type': 'Project',
      'Retail': 'Retail',
      'Wholesalers': 'Wholesaler',
      'Local Contractor': 'Local Contractors'
    };
    
    // Industry to display category mapping for better frontend filtering
    var industryToDisplayCategory = {
      'Broker': 'Broker',
      'Exchange': 'Exchange',
      'Local Contractors': 'Local Contractors',
      'Project': 'Project',
      'Retail': 'Retail',
      'Wholesaler': 'Wholesaler',
      // Map specific industries to display categories
      'Construction': 'Project',
      'Technology': 'Project',
      'Finance': 'Project',
      'Wholesale': 'Wholesaler'
    };

    console.log('=== STARTING ROW PROCESSING ===');
    console.log('Total rows to process: ' + data.length);
    
    for (var i = 0; i < data.length; i++) {
      try {
        console.log('=== PROCESSING ROW ' + (i + 1) + ' of ' + data.length + ' ===');
        var currentRow = data[i];
        console.log('Current row data:', currentRow);
        console.log('Available columns in row:', Object.keys(currentRow));
        console.log('SUB-CATEGORY2 value:', currentRow['SUB-CATEGORY2']);
        console.log('SUB-CATEGORY value:', currentRow['SUB-CATEGORY']);
        
        // Map the columns to our Directory model fields
        var company = currentRow.COMPANY || currentRow.company || currentRow.Company || '';
        var email = currentRow.EMAIL || currentRow['EMAIL '] || currentRow.email || currentRow.Email || '';
        var phone = currentRow['PHONE NUMBER'] || currentRow['PHONE_NUMBER'] || currentRow.phone || currentRow.Phone || currentRow['Phone Number'] || '';
        var contact = currentRow.CONTACT || currentRow.contact || currentRow.Contact || currentRow.address || currentRow.Address || '';
        var website = currentRow.WEBSITE || currentRow.website || currentRow.Website || '';
        var category = currentRow.CATEGORY || currentRow.category || currentRow.Category || currentRow.industry || currentRow.Industry || '';
        var subcategory = currentRow['SUB-CATEGORY2'] || currentRow['SUB-CATEGORY'] || currentRow.subcategory || currentRow.Subcategory || currentRow.description || currentRow.Description || '';
        
        console.log('Initial subcategory mapping - SUB-CATEGORY2:', currentRow['SUB-CATEGORY2'], 'SUB-CATEGORY:', currentRow['SUB-CATEGORY']);
        
        // If subcategory is empty, try to get it from other possible column names
        if (!subcategory || subcategory.trim() === '') {
          subcategory = currentRow['SUB-CATEGORY2'] || currentRow['SUB-CATEGORY'] || currentRow['Sub-Category'] || currentRow['Sub-Category2'] || '';
          console.log('Trying alternative column names for subcategory:', subcategory);
        }
        
        // Only set default if still empty
        if (!subcategory || subcategory.trim() === '') {
          subcategory = '';
          console.log('Subcategory is empty, setting to empty string');
        } else {
          console.log('Subcategory found:', subcategory);
        }
        
        console.log('Mapped values - Company:', company, 'Email:', email, 'Phone:', phone, 'Category:', category);
        
        // Clean up any trailing/leading spaces in key fields
        email = email.trim();
        company = company.trim();
        phone = phone.trim();
        category = category.trim();
        
        // ALWAYS use the tab name for categorization, ignore the CATEGORY field from file
        var tabName = currentRow._sheet || '';
        category = tabToIndustry[tabName] || tabName;
        console.log('Categorized row from tab "' + tabName + '" to industry "' + category + '" (ignoring file CATEGORY field)');
        
        // Map the industry to a display category for better frontend filtering
        var displayCategory = industryToDisplayCategory[category] || category;
        console.log('Industry mapping - Original:', category, 'Tab:', currentRow._sheet, 'Display Category:', displayCategory);
        if (displayCategory !== category) {
          console.log('Mapped industry "' + category + '" to display category "' + displayCategory + '"');
        }
        
        // For Local Contractors, automatically set contractorType from CATEGORY column (not SUB-CATEGORY2)
        var contractorType = '';
        var customContractorType = '';
        if (displayCategory === 'Local Contractors') {
          // For Local Contractors, use the CATEGORY field from the file as contractor type
          var originalCategory = currentRow.CATEGORY || currentRow.category || currentRow.Category || '';
          contractorType = originalCategory && originalCategory.trim() !== '' ? originalCategory.trim() : 'General Contractor';
          console.log('Auto-setting contractor type for Local Contractor from CATEGORY field:', contractorType);
        }
        
        var directoryData = {
          company: company,
          email: email,
          phone: phone,
          address: contact,
          website: website,
          industry: category,
          displayCategory: displayCategory, // Add display category for frontend filtering
          description: subcategory,
          city: '',
          state: '',
          country: '',
          package: 'free',
          contractorType: contractorType, // Add contractor type for Local Contractors
          customContractorType: customContractorType, // Add custom contractor type
          createdAt: new Date()
        };
        
        console.log('Directory data prepared:', directoryData);
        console.log('displayCategory field value:', directoryData.displayCategory);

        // Validate required fields
        var missingFields = [];
        if (!directoryData.company || directoryData.company.trim() === '') missingFields.push('company');
        if (!directoryData.email || directoryData.email.trim() === '') missingFields.push('email');
        if (!directoryData.phone || directoryData.phone.trim() === '') missingFields.push('phone');
        if (!directoryData.industry || directoryData.industry.trim() === '') missingFields.push('industry');
        
        if (missingFields.length > 0) {
          console.log('Row ' + (i + 2) + ' has missing fields:', missingFields);
          errors.push({
            row: i + 2,
            sheet: currentRow._sheet || 'Unknown',
            error: 'Missing required fields: ' + missingFields.join(', '),
            data: currentRow,
            mappedData: directoryData
          });
          continue;
        }

        // Duplicate email check removed - allow all emails to be processed
        console.log('Processing row ' + (i + 2) + ' - duplicate emails allowed');

        // Create new directory entry
        console.log('Creating new directory entry for row ' + (i + 2));
        var directory = new Directory(directoryData);
        console.log('Directory object created, saving...');
        await directory.save();
        console.log('Directory saved successfully for row ' + (i + 2));
        
        results.push({
          row: i + 2,
          sheet: currentRow._sheet || 'Unknown',
          company: directoryData.company,
          email: directoryData.email,
          status: 'success'
        });
        
        uploadedCount++;
        console.log('Row ' + (i + 2) + ' processed successfully. Total uploaded: ' + uploadedCount);

      } catch (error) {
        console.error('ERROR processing row ' + (i + 2) + ':', error);
        console.error('Error stack:', error.stack);
        errors.push({
          row: i + 2,
          sheet: data[i]._sheet || 'Unknown',
          error: error.message,
          data: data[i]
        });
      }
    }
    
    console.log('=== ROW PROCESSING COMPLETED ===');
    console.log('Final results - Uploaded:', uploadedCount, 'Errors:', errors.length, 'Total processed:', data.length);

    console.log('=== SAVING UPLOAD METADATA ===');
    
    // Save upload file metadata
    try {
      var uploadMetadata = new UploadedFile({
        fileName: req.file.originalname,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        totalRows: data.length,
        successfulUploads: uploadedCount,
        failedUploads: errors.length,
        fileType: req.file.originalname.split('.').pop().toLowerCase(),
        status: errors.length === 0 ? 'completed' : (uploadedCount > 0 ? 'partial' : 'failed')
      });
      
      await uploadMetadata.save();
      console.log('Upload metadata saved successfully');
    } catch (metadataError) {
      console.error('Failed to save upload metadata:', metadataError);
      // Don't fail the upload if metadata saving fails
    }
    
    console.log('=== PREPARING RESPONSE ===');
    var responseData = {
      success: true,
      message: 'Bulk upload completed. ' + uploadedCount + ' listings uploaded successfully.',
      uploadedCount: uploadedCount,
      totalRows: data.length,
      errors: errors,
      results: results
    };
    console.log('Response data prepared:', responseData);
    
    console.log('=== SENDING RESPONSE ===');
    res.json(responseData);
    console.log('=== RESPONSE SENT SUCCESSFULLY ===');

  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ 
      error: 'Failed to process file upload',
      details: err.message 
    });
  }
});

// GET: Get uploaded file history
router.get('/upload-history', async (req, res) => {
  try {
    const uploadedFiles = await UploadedFile.find().sort({ uploadDate: -1 });
    res.json(uploadedFiles);
  } catch (err) {
    console.error('Get upload history error:', err);
    res.status(500).json({ 
      error: 'Failed to get upload history',
      details: err.message 
    });
  }
});

// DELETE: Clear all directory listings (for testing purposes)
router.delete('/clear-all', async (req, res) => {
  try {
    const result = await Directory.deleteMany({});
    // Also clear upload history
    await UploadedFile.deleteMany({});
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} directory listings and upload history`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Clear all error:', err);
    res.status(500).json({ 
      error: 'Failed to clear directory listings',
      details: err.message 
    });
  }
});

module.exports = router; 