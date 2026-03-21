const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// @route   GET api/notifications
// @desc    Get user's recent notifications
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20); // Only get the 20 most recent
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/read
// @desc    Mark all user's notifications as read
router.put('/read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// --- HELPER FUNCTION: Import this in other route files to create a notification ---
// Example usage in another file: const { createNotification } = require('./notifications');
const createNotification = async (userId, message, type = 'info', link = '') => {
  try {
    const newNotif = new Notification({ user: userId, message, type, link });
    await newNotif.save();
    return newNotif;
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
};

module.exports = router;
module.exports.createNotification = createNotification;