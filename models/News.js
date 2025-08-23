const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({}, { strict: false }); // Allow any fields

module.exports = mongoose.model('News', newsSchema, 'news');
