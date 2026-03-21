const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const upload = multer({ storage: multer.memoryStorage() });

// @route   GET api/portfolio
// @desc    Get all projects for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ orderIndex: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/portfolio
// @desc    Create a new project
router.post('/', auth, async (req, res) => {
  try {
    const newProject = new Project({
      user: req.user.id,
      title: 'New Project',
      description: 'Describe your project here...',
      orderIndex: await Project.countDocuments({ user: req.user.id }) // Add to end
    });

    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/portfolio/:id
// @desc    Update a project
router.put('/:id', auth, async (req, res) => {
  try {
    // Ensure the project belongs to the user
    let project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/portfolio/:id
// @desc    Delete a project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    res.json({ msg: 'Project deleted' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/portfolio/upload-image/:id
// @desc    Upload an image for a specific project
router.post('/upload-image/:id', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file provided' });

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, { folder: "devpulse/projects" });

    // Update the project with the new image URL
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { image: result.secure_url } },
      { new: true }
    );

    res.json(project);
  } catch (err) {
    res.status(500).send('Image upload failed');
  }
});

module.exports = router;