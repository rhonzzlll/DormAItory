const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Ensure correct path
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST endpoint for user login
router.post('/', async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).send({ message: 'Invalid Email or Password' });

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(401).send({ message: 'Invalid Email or Password' });

    const token = user.generateAuthToken();
    res.status(200).send({
      "_id": user["_id"],
      token,
      role: user.role,
      message: 'Logged in successfully'
    });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Google login route
router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, given_name, family_name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        firstName: given_name,
        lastName: family_name,
        email,
        password: '', // No password for Google login
        role: 'tenant', // Default role
      });
      await user.save();
    }

    const authToken = user.generateAuthToken();

    res.status(200).send({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: authToken,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).send('An error occurred during Google login. Please try again.');
  }
});

// Validation schema using Joi
const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().required().label('Password'),
  });
  return schema.validate(data);
};

module.exports = router;