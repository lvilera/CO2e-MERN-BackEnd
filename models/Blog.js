const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    fr: { type: String, required: true },
    es: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    fr: { type: String, required: true },
    es: { type: String, required: true }
  },
  tags: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    default: 'General',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Blog', blogSchema, 'blogs');
