const express = require('express');
const multer = require('multer');
const { cloudinary } = require('../cloudinary');
const FeaturedListing = require('../models/FeaturedListing');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload a new featured image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
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
    const featured = new FeaturedListing({ imageUrl: result.secure_url });
    await featured.save();
    res.status(201).json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all featured images
router.get('/', async (req, res) => {
  try {
    const listings = await FeaturedListing.find().sort({ createdAt: 1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a featured image
router.delete('/:id', async (req, res) => {
  try {
    const listing = await FeaturedListing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 