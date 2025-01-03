// models/contactMessage.js
const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: String,
  category: String,
  content: String,
  status: String,
  fullname: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
  thread: [{
    sender: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
  }],
});

module.exports = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);