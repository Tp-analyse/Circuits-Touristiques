import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String },
  experience: { type: Number, default: 0 }
});

export default mongoose.model('Guide', guideSchema);