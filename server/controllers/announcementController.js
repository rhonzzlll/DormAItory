const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcementModel');

// Get all announcements and events
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ message: err.message });
  }
});

// Add a new announcement or event
router.post('/', async (req, res) => {
  const { content, description, type, date, title } = req.body;

  if (!content || !description || !type || !title) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const announcement = new Announcement({
    content,
    description,
    type,
    date,
    title,
  });

  try {
    const newAnnouncement = await announcement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    console.error('Error adding announcement:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update an announcement or event
router.put('/:id', async (req, res) => {
  const { content, description, type, date, title } = req.body;

  if (!content || !description || !type || !title) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      console.error(`Announcement with id ${req.params.id} not found`);
      return res.status(404).json({ message: 'Announcement not found' });
    }

    announcement.title = title;
    announcement.content = content;
    announcement.description = description;
    announcement.type = type;
    announcement.date = date;

    const updatedAnnouncement = await announcement.save();
    res.json(updatedAnnouncement);
  } catch (err) {
    console.error(`Error updating announcement with id ${req.params.id}:`, err);
    res.status(400).json({ message: err.message });
  }
});

// Delete an announcement or event
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      console.error(`Announcement with id ${req.params.id} not found`);
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await announcement.remove();
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    console.error(`Error deleting announcement with id ${req.params.id}:`, err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;