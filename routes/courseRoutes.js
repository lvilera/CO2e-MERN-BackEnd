const express = require('express');
const multer = require('multer');
const { storage3 } = require('../cloudinary');
const upload = multer({ storage: storage3 });
const Course = require('../models/Course');

const router = express.Router();

// Add Course
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, professor, commencing, fileURL } = req.body;
    const image = req.file;

    if (!title || !description || !professor || !commencing || !fileURL || !image) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newCourse = new Course({
      title,
      description,
      professor,
      commencing,
      fileURL,
      imageURL: image.path
    });
    await newCourse.save();
    res.status(201).json({ message: 'Course added successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get all Courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Course by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Course
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, professor, commencing, fileURL } = req.body;
    const image = req.file;
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const updateFields = {
      ...(title && { title }),
      ...(description && { description }),
      ...(professor && { professor }),
      ...(commencing && { commencing }),
      ...(fileURL && { fileURL }),
      ...(image && { imageURL: image.path })
    };

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    )

    res.json(updatedCourse);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;