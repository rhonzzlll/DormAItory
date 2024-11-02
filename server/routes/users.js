const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');

const User = require("../models/user"); // Ensure the User model is correctly set up
const Chatroom = require("../models/chatroom");
const ChatroomMembers = require("../models/chatroomMembers");

// POST route to handle user registration
router.post("/", async (req, res) => {
  try {
    // Check if user already exists
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    
    if (userExists) 
      return res.status(400).send({ message: "User already exists" });

    // Save new user with role
    const user = await new User(req.body).save();

    if (user) {
      const chatroom = await new Chatroom().save();

      new ChatroomMembers({ chatroomId: chatroom["_id"], userId: user["_id"]}).save();
      new ChatroomMembers({ chatroomId: chatroom["_id"], userId: new mongoose.Types.ObjectId("67249b84b01d71f586fdca22") }).save();

      return res.status(201).send({ message: "User registered successfully" });
    }

    return res.status(500).send({ message: "Something went wrong! Please try again." });
  } catch (error) {
    return res.status(500).send(error);
  }
});

module.exports = router;
