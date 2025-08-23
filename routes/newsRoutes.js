const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const mongoose = require('mongoose');

const News = require('../models/News');

// Function to generate a placeholder image URL when Cloudinary is unavailable
const getPlaceholderImage = (category) => {
  const placeholders = {
    'react': 'https://via.placeholder.com/500x300/61dafb/ffffff?text=React+News',
    'test': 'https://via.placeholder.com/500x300/28a745/ffffff?text=Test+News',
    'general': 'https://via.placeholder.com/500x300/6c757d/ffffff?text=News',
    'default': 'https://via.placeholder.com/500x300/007bff/ffffff?text=News'
  };
  return placeholders[category] || placeholders.default;
};

// POST: Add news
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { 
      titleEn, titleFr, titleEs, 
      descriptionEn, descriptionFr, descriptionEs, 
      tags, category 
    } = req.body;

    console.log('📝 Received news data:', { titleEn, titleFr, titleEs, category, tags });

    // Validate required fields
    if (!titleEn || !titleFr || !titleEs || !descriptionEn || !descriptionFr || !descriptionEs) {
      return res.status(400).json({ error: 'All title and description fields are required' });
    }

    let imageUrl = '';
    
    // Handle image upload with error handling
    if (req.file) {
      try {
        imageUrl = req.file.path;
        console.log('✅ Image uploaded successfully:', imageUrl);
      } catch (imageError) {
        console.error('⚠️ Image upload failed, using placeholder image:', imageError.message);
        imageUrl = getPlaceholderImage(category);
        console.log('🖼️ Using placeholder image:', imageUrl);
      }
    } else {
      console.log('ℹ️ No image provided, using placeholder image');
      imageUrl = getPlaceholderImage(category);
      console.log('🖼️ Using placeholder image:', imageUrl);
    }

    const news = new News({
      title: {
        en: titleEn,
        fr: titleFr,
        es: titleEs
      },
      description: {
        en: descriptionEn,
        fr: descriptionFr,
        es: descriptionEs
      },
      tags: tags ? tags.split(',').filter(tag => tag.trim()) : [], // Filter out empty tags
      category: category || 'General',
      imageUrl: imageUrl,
    });

    const savedNews = await news.save();
    console.log('✅ News saved successfully:', savedNews._id);
    res.status(200).json(savedNews);
  } catch (error) {
    console.error('❌ Error adding news:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: All news (with language parameter)
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Attempting to fetch news from database...');
    
    // Check what collection the News model is using
    console.log('📚 News model collection name:', News.collection.name);
    console.log('📚 News model collection namespace:', News.collection.namespace);
    
    const { lang = 'en' } = req.query;
    const data = await News.find().sort({ createdAt: -1 });
    console.log('📊 News data found:', data.length, 'documents');
    
    if (data.length > 0) {
      console.log('📝 Sample news document:', JSON.stringify(data[0], null, 2));
    }
    
    // If no data found, try to access the collection directly
    if (data.length === 0) {
      console.log('🔍 No news data found via model, trying direct collection access...');
      try {
        const db = mongoose.connection.db;
        const directNews = await db.collection('news').find({}).toArray();
        console.log('🔍 Direct collection access found:', directNews.length, 'documents');
        if (directNews.length > 0) {
          console.log('📝 Sample direct document:', JSON.stringify(directNews[0], null, 2));
        }
      } catch (directError) {
        console.log('❌ Direct collection access failed:', directError.message);
      }
    }
    
    // Transform data to include language-specific content
    const transformedData = data.map(item => ({
      _id: item._id,
      title: item.title && item.title[lang] ? item.title[lang] : (item.title && item.title.en ? item.title.en : 'Untitled'),
      description: item.description && item.description[lang] ? item.description[lang] : (item.description && item.description.en ? item.description.en : 'No description available'),
      tags: item.tags || [],
      category: item.category || 'General',
      imageUrl: item.imageUrl || '',
      createdAt: item.createdAt
    }));
    
    res.json(transformedData);
  } catch (error) {
    console.error('❌ Error fetching news:', error);
    res.status(500).json({ error: error.message });
  }
 });

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const result = await News.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH: Update news image (add placeholder if missing)
router.patch('/:id/image', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // If no image or empty imageUrl, add placeholder
    if (!news.imageUrl || news.imageUrl === '') {
      const placeholderUrl = getPlaceholderImage(news.category);
      news.imageUrl = placeholderUrl;
      await news.save();
      console.log('🖼️ Added placeholder image to news:', news._id);
      res.json({ message: 'Placeholder image added', imageUrl: placeholderUrl });
    } else {
      res.json({ message: 'News already has an image', imageUrl: news.imageUrl });
    }
  } catch (error) {
    console.error('Error updating news image:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const post = await News.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    // Transform to include language-specific content
    const transformedPost = {
      _id: post._id,
      title: post.title && post.title[lang] ? post.title[lang] : (post.title && post.title.en ? post.title.en : 'Untitled'),
      description: post.description && post.description[lang] ? post.description[lang] : (post.description && post.description.en ? post.description.en : 'No description available'),
      tags: post.tags || [],
      category: post.category || 'General',
      imageUrl: post.imageUrl || '',
      createdAt: post.createdAt
    };
    
    res.json(transformedPost);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: "Error fetching post" });
  }
});

module.exports = router;
