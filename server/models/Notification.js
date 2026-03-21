const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, default: 'info' }, // 'info', 'success', 'warning'
  link: { type: String, default: '' } // Optional: link to redirect when clicked
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);