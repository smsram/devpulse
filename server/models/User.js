const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true }, // Replaced githubUsername
  password: { type: String, required: true },
  // These can be removed if they are fully handled by the Settings schema now, 
  // but keeping them here is fine for fallback.
  role: { type: String, default: 'Software Engineer' },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);