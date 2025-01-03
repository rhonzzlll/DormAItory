const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  content: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true },
  date: { type: Date },
  title: { type: String },
});

module.exports = mongoose.model('Announcement', announcementSchema);