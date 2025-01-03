// server/controllers/announcementController.js
const Announcement = require('../models/announcementModel');

// Get all announcements and events
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new announcement or event
exports.createAnnouncement = async (req, res) => {
  const { content, description, date, title, type } = req.body;

  if (!content || !type) {
    return res.status(400).json({ message: 'Content and type are required' });
  }

  const announcement = new Announcement({
    content,
    description,
    date,
    title,
    type
  });

  try {
    const newAnnouncement = await announcement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an announcement or event
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    await announcement.remove();
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};