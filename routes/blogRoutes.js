const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Blog = require('../models/Blog');

// POST: Add a blog
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

    const blog = new Blog({
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

    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error adding blog:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET: All blogs (with optional filter and language parameter)
router.get('/', async (req, res) => {
  try {
    const { category, tag, lang = 'en' } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    
    // Transform data to include language-specific content
    const transformedBlogs = blogs.map(item => ({
      _id: item._id,
      title: item.title && item.title[lang] ? item.title[lang] : (item.title && item.title.en ? item.title.en : 'Untitled'),
      description: item.description && item.description[lang] ? item.description[lang] : (item.description && item.description.en ? item.description.en : 'No description available'),
      tags: item.tags || [],
      category: item.category || 'General',
      imageUrl: item.imageUrl || '',
      createdAt: item.createdAt
    }));
    
    res.status(200).json(transformedBlogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Delete a blog by ID
router.delete('/:id', async (req, res) => {
  try {
    const result = await Blog.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/fblogs/:id', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    // Transform to include language-specific content
    const transformedBlog = {
      _id: blog._id,
      title: blog.title && blog.title[lang] ? blog.title[lang] : (blog.title && blog.title.en ? blog.title.en : 'Untitled'),
      description: blog.description && blog.description[lang] ? blog.description[lang] : (blog.description && blog.description.en ? blog.description.en : 'No description available'),
      tags: blog.tags || [],
      category: blog.category || 'General',
      imageUrl: blog.imageUrl || '',
      createdAt: blog.createdAt
    };
    
    res.json(transformedBlog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ message: 'Error fetching blog' });
  }
});

module.exports = router;
