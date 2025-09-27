const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary configuration with actual credentials
cloudinary.config({
  cloud_name: 'dftnqqcjz', // ✅ Your actual cloud name
  api_key: '419724397335875',
  api_secret: 'Q7usOM7s5EsyeubXFzy5fQ1I_7A',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'newsImages',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [
      { width: 500, height: 600, crop: 'fill', gravity: 'auto' }
    ],
  },
});

const storage2 = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'guideImages',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    // transformation: [
    //   { width: 500, height: 600, crop: 'fill', gravity: 'auto' }
    // ],
  },
});

const storage3 = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'courseImages',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    // transformation: [
    //   { width: 500, height: 600, crop: 'fill', gravity: 'auto' }
    // ],
  },
});

module.exports = { cloudinary, storage, storage2, storage3 };
