const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcementModel');

// Get all announcements and events
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new announcement or event
router.post('/', async (req, res) => {
  const announcement = new Announcement({
    content: req.body.content,
    description: req.body.description,
    type: req.body.type,
    date: req.body.date,
    title: req.body.title,
  });

  try {
    const newAnnouncement = await announcement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an announcement or event
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    await announcement.remove();
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;