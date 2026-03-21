const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Settings = require('../models/Settings');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- HELPER: Base64 Converter ---
const convertToBase64 = (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  return "data:" + file.mimetype + ";base64," + b64;
};

// @route   POST api/settings/upload-avatar
// @desc    Upload image to Cloudinary
router.post('/upload-avatar', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No image provided' });

    const dataURI = convertToBase64(req.file);
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "devpulse/avatars",
    });

    res.json({ secure_url: result.secure_url });
  } catch (err) {
    res.status(500).send('Image upload failed');
  }
});

// @route   POST api/settings/upload-resume
// @desc    Upload PDF/Doc to Cloudinary
router.post('/upload-resume', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file provided' });

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "devpulse/resumes",
      // Keep it as 'image' or 'auto' so it generates a standard /image/upload/ URL
      // which allows the browser's native PDF viewer to open it!
      resource_type: "image", 
    });

    res.json({ secure_url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary Resume Upload Error:", err);
    res.status(500).send('Resume upload failed');
  }
});

// @route   GET api/settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let settings = await Settings.findOne({ user: req.user.id });

    if (!settings) {
      settings = new Settings({ user: req.user.id });
      await settings.save();
    }
    res.json({ user, settings });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/settings
router.put('/', auth, async (req, res) => {
  const { name, role, bio, skills, githubHandle, portfolioLink, resumeLink, profilePicture } = req.body;

  try {
    // 1. Update core user data
    if (name || githubHandle) {
      await User.findByIdAndUpdate(
        req.user.id, 
        { $set: { name, githubUsername: githubHandle } }, 
        { returnDocument: 'after' } 
      );
    }

    // 2. Update extended settings
    const settingsFields = {
      headline: role,
      bio,
      skills,
      githubHandle,
      portfolioLink,
      resumeLink,
      profilePicture 
    };

    const settings = await Settings.findOneAndUpdate(
      { user: req.user.id },
      { $set: settingsFields },
      { returnDocument: 'after', upsert: true } 
    );

    res.json(settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Update failed');
  }
});

// @route   PUT api/settings/visibility
// @desc    Update portfolio visibility toggle
// @access  Private
router.put('/visibility', auth, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { user: req.user.id },
      { $set: { 'preferences.portfolioIsPublic': req.body.portfolioIsPublic } },
      { returnDocument: 'after' }
    );
    res.json(settings.preferences);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;