const express = require('express');
const multer = require('multer');
const { cloudinary } = require('../cloudinary');
const Course = require('../models/Course');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to upload a file buffer to Cloudinary
async function uploadToCloudinary(buffer, folder, resource_type, originalname) {
  return await cloudinary.uploader.upload_stream(
    {
      folder,
      resource_type,
      public_id: originalname.split('.')[0],
    },
    (error, result) => {
      if (error) throw error;
      return result;
    }
  );
}

// Create a new course with videos and PDFs
router.post('/upload', upload.fields([{ name: 'videos' }]), async (req, res) => {
  try {
    const { title } = req.body;
    let driveLinks = req.body.driveLinks || [];
    if (typeof driveLinks === 'string') driveLinks = [driveLinks];
    const videos = [];

    if (req.files['videos']) {
      for (let idx = 0; idx < req.files['videos'].length; idx++) {
        const file = req.files['videos'][idx];
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'course_videos',
              resource_type: 'video',
              public_id: file.originalname.split('.')[0],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
        videos.push({
          url: result.secure_url,
          name: file.originalname,
          driveLink: driveLinks[idx] || '',
        });
      }
    }

    const course = new Course({ title, videos });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a course by ID
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 