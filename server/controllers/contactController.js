const mongoose = require('mongoose');
const Message = require('../models/contactMessage');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all messages with pagination
exports.getAllMessages = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

  try {
    const messages = await Message.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const totalMessages = await Message.countDocuments();

    res.json({
      totalMessages,
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page,
      messages // Ensure messages is an array
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get a specific message by ID
exports.getMessageById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid message ID' });
  }

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    console.error('Error fetching message by ID:', err);
    res.status(500).json({ message: err.message });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  const { sender, recipient, subject, category, content, status, fullname, thread } = req.body;

  const newMessage = new Message({
    sender,
    recipient,
    subject,
    category,
    content,
    status,
    fullname,
    thread
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage); // Send the saved message back to the frontend
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(400).json({ message: err.message });
  }
};

// Update a message by ID
exports.updateMessage = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid message ID' });
  }

  try {
    const updatedMessage = await Message.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(updatedMessage);
  } catch (err) {
    console.error('Error updating message:', err);
    res.status(400).json({ message: err.message });
  }
};

// Delete a message by ID
exports.deleteMessage = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid message ID' });
  }

  try {
    const deletedMessage = await Message.findByIdAndDelete(id);
    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: err.message });
  }
};
