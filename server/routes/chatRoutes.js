const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');

// Define routes and attach controller methods
router.get('/prompts', chatController.getPrompts);
router.get('/messages/:id', chatController.getMessages);
router.post('/prompts/upsert', chatController.upsertPrompt);
router.post('/prompts/delete', chatController.deletePrompt);
router.post('/message/send/:id', chatController.sendMessage);
router.post('/chatroom', chatController.getChatroom);

module.exports = router;