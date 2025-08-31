const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { cloudinary } = require('../cloudinary');
const ServiceImage = require('../models/ServiceImage');
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
      return res.status(403).json({ error: 'Admin access required. Only administrators can upload service images.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(401).json({ error: 'Invalid admin authentication. Please login as admin.' });
  }
};

// Upload a new service image (ADMIN ONLY)
router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('🔒 Admin service image upload request received');
    
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    
    console.log('📤 Uploading image to service_images folder...');
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'service_images',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });
    
    const serviceImage = new ServiceImage({ 
      imageUrl: result.secure_url,
      uploadedBy: 'admin'
    });
    await serviceImage.save();
    
    console.log('✅ Service image uploaded successfully:', result.secure_url);
    res.status(201).json(serviceImage);
  } catch (err) {
    console.error('❌ Service image upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all service images (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const images = await ServiceImage.find().sort({ createdAt: -1 });
    console.log(`🔍 Service images found: ${images.length}`);
    res.json(images);
  } catch (err) {
    console.error('❌ Error fetching service images:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a service image (ADMIN ONLY)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    console.log('🗑️ Admin deleting service image:', req.params.id);
    const image = await ServiceImage.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ error: 'Service image not found' });
    console.log('✅ Service image deleted successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Service image deletion error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 