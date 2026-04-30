const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String },
  experience: { type: Number, default: 0 }
});

module.exports = mongoose.model('Guide', guideSchema);