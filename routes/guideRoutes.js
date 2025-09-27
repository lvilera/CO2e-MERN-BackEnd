const express = require('express');
const multer = require('multer');
const { storage2 } = require('../cloudinary');
const upload = multer({ storage: storage2 });
const Guide = require('../models/Guide');

const router = express.Router();

// Add Guide
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, fileURL } = req.body;
        const image = req.file;

        if (!title || !fileURL || !image) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const newGuide = new Guide({
            title,
            fileURL,
            imageURL: image.path
        });
        await newGuide.save();
        res.status(201).json({ message: 'Guide added successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get all Guides
router.get('/', async (req, res) => {
    try {
        const guides = await Guide.find({});
        res.json(guides);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Guide by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const guide = await Guide.findByIdAndDelete(id);
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }
        res.status(200).json({ message: 'Guide deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Guide
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, fileURL } = req.body;
        const image = req.file;
        const { id } = req.params;

        const guide = await Guide.findById(id);
        if (!guide) {
            return res.status(404).json({ message: 'Guide not found' });
        }

        const updateFields = {
            ...(title && { title }),
            ...(fileURL && { fileURL }),
            ...(image && { imageURL: image.path })
        };

        const updatedGuide = await Guide.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        )

        res.json(updatedGuide);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;