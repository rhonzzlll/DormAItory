const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
}, { timestamps: true });

const Chatroom = mongoose.model('Chatroom', chatroomSchema);

module.exports = Chatroom;