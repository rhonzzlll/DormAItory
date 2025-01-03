const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user"); // Ensure the User model is correctly set up

// GET route to fetch all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong! Please try again." });
  }
});

// GET route to fetch a user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ "_id": new mongoose.Types.ObjectId(id) });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong! Please try again." });
  }
});

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
      return res.status(201).send({ message: "User registered successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong! Please try again." });
  }
});

// PUT route to update user profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If profileImage is a base64 string, handle it accordingly
    if (updateData.profileImage && updateData.profileImage.startsWith('data:image')) {
      // Here you can save the base64 string directly to the database or convert it to a file
      // For simplicity, we'll save it directly to the database
    }

    // Find the user by ID and update
    const user = await User.findOneAndUpdate(
      { "_id": new mongoose.Types.ObjectId(id) },
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong! Please try again." });
  }
});

module.exports = router;