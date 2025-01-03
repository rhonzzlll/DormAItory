const Message = require('../models/contactMessage');

// Get messages based on user role
const getMessages = async (req, res) => {
  const { userId, userRole } = req.query;
  try {
    let messages;
    if (userRole === 'admin') {
      messages = await Message.find();
    } else {
      messages = await Message.find({ userId });
    }
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new message
const createMessage = async (req, res) => {
  const message = new Message(req.body);
  try {
    const newMessage = await message.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an existing message thread
const updateMessageThread = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    message.thread.push(req.body.thread[0]);
    const updatedMessage = await message.save();
    res.json(updatedMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    await message.remove();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMessages,
  createMessage,
  updateMessageThread,
  deleteMessage,
};