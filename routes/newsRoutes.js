const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const News = require('../models/News');

// POST: Add news
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { 
      titleEn, titleFr, titleEs, 
      descriptionEn, descriptionFr, descriptionEs, 
      tags, category 
    } = req.body;

    // Validate required fields
    if (!titleEn || !titleFr || !titleEs || !descriptionEn || !descriptionFr || !descriptionEs) {
      return res.status(400).json({ error: 'All title and description fields are required' });
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
      imageUrl: req.file ? req.file.path : '',
    });

    await news.save();
    res.status(200).json(news);
  } catch (error) {
    console.error('Error adding news:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: All news (with language parameter)
router.get('/', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const data = await News.find().sort({ createdAt: -1 });
    
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
    console.error('Error fetching news:', error);
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
