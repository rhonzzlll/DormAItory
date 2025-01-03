const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

// Create a new visitor registration
router.post('/register', async (req, res) => {
  try {
    const form = new Form(req.body);
    await form.save();
    res.status(201).send(form);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all visitor registrations
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find();
    res.status(200).send(forms);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get a specific visitor registration
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).send('Visitor registration not found');
    }
    res.status(200).send(form);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a visitor registration
router.put('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!form) {
      return res.status(404).send('Visitor registration not found');
    }
    res.status(200).send(form);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update visitor status
router.put('/status/update', async (req, res) => {
  try {
    const { id, status } = req.body;
    const form = await Form.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!form) {
      return res.status(404).send('Visitor registration not found');
    }
    res.status(200).send(form);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a visitor registration
router.delete('/:id', async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) {
      return res.status(404).send('Visitor registration not found');
    }
    res.status(200).send('Visitor registration deleted');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;