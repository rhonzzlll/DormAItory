const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  postedBy: {
    type: String,
    default: 'management'
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Add index for improved query performance
announcementSchema.index({ date: -1 });
announcementSchema.index({ priority: 1, date: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);