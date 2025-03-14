const Announcement = require('../models/announcementModel');
const asyncHandler = require('express-async-handler');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { active: true };

  // Add priority filter if provided
  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  const announcements = await Announcement.find(filter)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit)
    .populate('postedBy', 'name role');

  // Get total count for pagination
  const total = await Announcement.countDocuments(filter);

  res.json({
    announcements,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Public
const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('postedBy', 'name role');

  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  res.json(announcement);
});

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, priority, date } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error('Please provide title and content');
  }

  try {
    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'medium',
      postedBy: 'management', // Always set to 'management'
      date: date || new Date()
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  // Ensure the date is a valid date object
  if (req.body.date) {
    req.body.date = new Date(req.body.date);
  }

  const updatedAnnouncement = await Announcement.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('postedBy', 'name role');

  res.json(updatedAnnouncement);
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }

  // Soft delete
  announcement.active = false;
  await announcement.save();

  res.json({ message: 'Announcement removed' });
});

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};