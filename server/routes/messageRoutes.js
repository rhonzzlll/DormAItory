// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Define routes
router.post('/', contactController.createContactMessage);
router.get('/', contactController.getContactMessages);
router.get('/:id', contactController.getContactMessageById);
router.put('/:id', contactController.updateContactMessageThread);
router.put('/:id/status', contactController.updateMessageStatus);
router.delete('/:id', contactController.deleteContactMessage);

module.exports = router;