const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');

// Define routes and attach controller methods
router.post('/message/send/:id', chatController.sendMessage);
router.get('/prompts', chatController.getPrompts);

module.exports = router;