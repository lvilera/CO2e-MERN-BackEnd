const express = require('express');
const multer = require('multer');
const { cloudinary } = require('../cloudinary');
const Directory = require('../models/Directory');
const FeaturedListing = require('../models/FeaturedListing');
const { getUserLocation } = require('../services/geolocationService');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST: Add a directory listing
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { company, email, phone, address, website, socialType, socialLink, industry, description, userPackage, city, state, country } = req.body;
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
    const userLocation = getUserLocation(req);
    
    if (!userLocation.city || userLocation.city === 'Unknown') {
      return res.status(400).json({ 
        error: 'Unable to determine your location. Please search by city name instead.' 
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
    
    res.json({
      success: true,
      debug: {
        detectedIP,
        userLocation,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'],
          'x-real-ip': req.headers['x-real-ip'],
          'remote-address': req.connection.remoteAddress,
          'socket-remote': req.socket.remoteAddress,
          'user-agent': req.headers['user-agent']
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 