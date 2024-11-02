const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, default: null }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;