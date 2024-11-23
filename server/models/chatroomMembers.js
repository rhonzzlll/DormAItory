const mongoose = require('mongoose');

const chatroomMembersSchema = new mongoose.Schema({
    chatroomId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatroom", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const ChatroomMembers = mongoose.model('ChatroomMembers', chatroomMembersSchema);

module.exports = ChatroomMembers;