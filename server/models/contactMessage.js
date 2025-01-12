const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  subject: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  fullname: { type: String, required: true },
  thread: [{
    sender: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);