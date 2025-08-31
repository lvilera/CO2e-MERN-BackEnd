const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../cloudinary');
const FeaturedListing = require('../models/FeaturedListing');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Admin authentication required. Please login as admin.' });
    }

    const decoded = jwt.verify(token, 'this_is_a_secure_jwt_secret_123456');
    
    // Check if user is admin
    if (decoded.role !== 'admin' || decoded.userId !== 'admin') {
      return res.status(403).json({ error: 'Admin access required. Only administrators can upload featured listings.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({ error: 'Invalid admin authentication. Please login as admin.' });
  }
};

// Upload a new featured image (ADMIN ONLY)
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('🔒 Admin featured image upload request received');
    console.log('👤 Admin user:', req.user);
    
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    
    console.log('📤 Uploading image to featured_listings folder...');
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'featured_listings',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });
    
    const featured = new FeaturedListing({ 
      imageUrl: result.secure_url,
      originalFileName: req.file.originalname,
      uploadedBy: 'admin',
      updatedAt: new Date()
    });
    await featured.save();
    
    console.log('✅ Featured image uploaded successfully:', result.secure_url);
    res.status(201).json(featured);
  } catch (err) {
    console.error('❌ Featured image upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all featured images (excluding ALL directory member images)
router.get('/', async (req, res) => {
  try {
    // Add cache-busting headers
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    
    const listings = await FeaturedListing.find({ isActive: true }).sort({ displayOrder: 1, createdAt: 1 });
    console.log(`🔍 Featured listings found in DB: ${listings.length}`);
    
    // Filter out any images that belong to directory members OR have directory_logos path
    const Directory = require('../models/Directory');
    const directoryImages = await Directory.find({ 
      imageUrl: { $ne: '', $exists: true }
    }).select('imageUrl');
    
    const directoryImageUrls = new Set(directoryImages.map(d => d.imageUrl));
    console.log(`📁 Directory images to filter out: ${directoryImageUrls.size}`);
    
    // Filter out:
    // 1. Any images that match directory member URLs
    // 2. Any images with "directory_logos" in the path (regardless of membership status)
    const filteredListings = listings.filter(listing => 
      !directoryImageUrls.has(listing.imageUrl) && 
      !listing.imageUrl.includes('directory_logos')
    );
    
    console.log(`✅ Final featured listings to return: ${filteredListings.length}`);
    filteredListings.forEach((listing, i) => {
      console.log(`   ${i + 1}. ${listing.imageUrl}`);
    });
    
    res.json(filteredListings);
  } catch (err) {
    console.error('❌ Error fetching featured listings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all featured listings for admin management (including inactive)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const listings = await FeaturedListing.find().sort({ displayOrder: 1, createdAt: 1 });
    console.log(`🔍 Admin fetched all featured listings: ${listings.length}`);
    res.json(listings);
  } catch (err) {
    console.error('❌ Error fetching admin featured listings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a featured listing (ADMIN ONLY)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    console.log('✏️ Admin updating featured listing:', req.params.id);
    const { title, description, link, displayOrder, isActive } = req.body;
    
    const listing = await FeaturedListing.findByIdAndUpdate(
      req.params.id,
      { 
        title: title || '',
        description: description || '',
        link: link || '',
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!listing) return res.status(404).json({ error: 'Featured listing not found' });
    console.log('✅ Featured listing updated successfully');
    res.json(listing);
  } catch (err) {
    console.error('❌ Featured listing update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a featured image (ADMIN ONLY)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    console.log('🗑️ Admin deleting featured image:', req.params.id);
    const listing = await FeaturedListing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    console.log('✅ Featured image deleted successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Featured image deletion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// EMERGENCY: Clear ALL featured listings (ADMIN ONLY)
router.post('/clear-all', requireAdmin, async (req, res) => {
  try {
    console.log('🚨 EMERGENCY: Clearing ALL featured listings...');
    const result = await FeaturedListing.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} featured listings`);
    res.json({ 
      success: true, 
      message: `Cleared ${result.deletedCount} featured listings`,
      cleared: result.deletedCount
    });
  } catch (err) {
    console.error('❌ Error clearing featured listings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Cleanup route: Remove ALL directory images from featured listings
router.post('/cleanup-premium-images', async (req, res) => {
  try {
    const Directory = require('../models/Directory');
    
    // Method 1: Remove by premium member URLs
    const premiumMembers = await Directory.find({ 
      package: 'premium',
      imageUrl: { $ne: '', $exists: true }
    }).select('imageUrl company');
    
    const premiumImageUrls = premiumMembers.map(member => member.imageUrl);
    
    // Method 2: Remove ANY featured listing that has "directory_logos" in the URL
    // This catches any directory images that might not be linked to current premium members
    const directoryImageListings = await FeaturedListing.find({
      imageUrl: { $regex: 'directory_logos', $options: 'i' }
    });
    
    let totalRemoved = 0;
    
    // Remove by premium member URLs
    if (premiumImageUrls.length > 0) {
      const result1 = await FeaturedListing.deleteMany({
        imageUrl: { $in: premiumImageUrls }
      });
      totalRemoved += result1.deletedCount;
    }
    
    // Remove by directory_logos folder path
    const result2 = await FeaturedListing.deleteMany({
      imageUrl: { $regex: 'directory_logos', $options: 'i' }
    });
    totalRemoved += result2.deletedCount;
    
    res.json({ 
      success: true, 
      message: `Removed ${totalRemoved} directory images from featured section`,
      removed: totalRemoved,
      premiumMembers: premiumMembers.map(m => ({ company: m.company, imageUrl: m.imageUrl })),
      directoryImagesFound: directoryImageListings.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 