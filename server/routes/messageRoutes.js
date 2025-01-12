const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Route to get all messages (with pagination)
router.get('/', contactController.getAllMessages);

// Route to get a single message by ID
router.get('/:id', contactController.getMessageById);

// Route to create a new message
router.post('/', contactController.createMessage);

// Route to update a message by ID
router.put('/:id', contactController.updateMessage);

// Route to delete a message by ID
router.delete('/:id', contactController.deleteMessage);

module.exports = router;
