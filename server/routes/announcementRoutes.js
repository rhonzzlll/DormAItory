// File: server/routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAnnouncements, 
  getAnnouncementById, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} = require('../controllers/announcementController');

// Public routes
router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

// Routes without middleware
router.post('/', createAnnouncement);
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

module.exports = router;