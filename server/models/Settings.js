const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  profilePicture: { type: String, default: '' },
  headline: { type: String, default: 'Software Engineer' },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  githubHandle: { type: String, default: '' },
  portfolioLink: { type: String, default: '' },
  resumeLink: { type: String, default: '' }, // <-- ADD THIS LINE
  preferences: {
    portfolioIsPublic: { type: Boolean, default: true },
    autoSyncGithub: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);