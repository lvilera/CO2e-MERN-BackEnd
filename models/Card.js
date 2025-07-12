const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
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
  link: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Card', cardSchema);
