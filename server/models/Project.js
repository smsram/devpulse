const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  role: { type: String, default: '' },
  techStack: { type: [String], default: [] },
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  image: { type: String, default: '' }, // Cloudinary URL
  orderIndex: { type: Number, default: 0 } // For drag-and-drop sorting later
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);