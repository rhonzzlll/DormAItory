const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user"); // Ensure the User model is correctly set up

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ "_id": new mongoose.Types.ObjectId(id) });

    if (user) {
      
    }

    console.log(user);
  } catch (error) {
    console.log(error);
  }

  return res.status(500).send({ message: "Something went wrong! Please try again." });
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
  }

  return res.status(500).send({ message: "Something went wrong! Please try again." });
});

module.exports = router;
