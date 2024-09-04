// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/user"); // Ensure the User model is correctly set up

// POST route to handle user registration
router.post("/", async (req, res) => {
  try {
    // Check if user already exists
    const { email } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).send({ message: "User already exists" });

    // Save new user
    user = new User(req.body);
    await user.save();
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
