const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const multer = require('multer');
const cloudinary = require('../cloudinary');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Create a new card
router.post('/cards', async (req, res) => {
  try {
    const { 
      titleEn, titleFr, titleEs, 
      descriptionEn, descriptionFr, descriptionEs, 
      link 
    } = req.body;

    // Validate required fields
    if (!titleEn || !titleFr || !titleEs || !descriptionEn || !descriptionFr || !descriptionEs || !link) {
      return res.status(400).json({ error: 'All title and description fields are required' });
    }

    const card = new Card({
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
      link
    });
    
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    console.error('Error creating card:', err);
    res.status(500).json({ message: 'Failed to create card' });
  }
});

// Get all cards (with language parameter)
router.get('/cards', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const cards = await Card.find();
    
    // Transform data to include language-specific content
    const transformedCards = cards.map(card => {
      let title, description;
      
      // Handle both old and new card structures
      if (card.title && typeof card.title === 'object' && card.title.en) {
        // New multi-language structure
        title = card.title[lang] || card.title.en || 'Untitled';
        description = card.description && card.description[lang] ? card.description[lang] : (card.description && card.description.en ? card.description.en : 'No description available');
      } else {
        // Old structure - simple strings
        title = card.title || 'Untitled';
        description = card.description || 'No description available';
      }
      
      return {
        _id: card._id,
        title: title,
        description: description,
        link: card.link || ''
      };
    });
    
    res.status(200).json(transformedCards);
  } catch (err) {
    console.error('Error fetching cards:', err);
    res.status(500).json({ message: 'Failed to fetch cards' });
  }
});

// Get single card by ID (with language parameter)
router.get('/cards/:id', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    let title, description;
    
    // Handle both old and new card structures
    if (card.title && typeof card.title === 'object' && card.title.en) {
      // New multi-language structure
      title = card.title[lang] || card.title.en || 'Untitled';
      description = card.description && card.description[lang] ? card.description[lang] : (card.description && card.description.en ? card.description.en : 'No description available');
    } else {
      // Old structure - simple strings
      title = card.title || 'Untitled';
      description = card.description || 'No description available';
    }
    
    // Transform to include language-specific content
    const transformedCard = {
      _id: card._id,
      title: title,
      description: description,
      link: card.link || ''
    };
    
    res.status(200).json(transformedCard);
  } catch (err) {
    console.error('Error fetching card:', err);
    res.status(500).json({ message: 'Failed to fetch card' });
  }
});

router.delete('/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Card.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
