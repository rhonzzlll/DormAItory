const express = require('express');
const router = express.Router();
const MaintenanceRequest = require('../models/MaintenanceRequest'); // Correct path to MaintenanceRequest model
const ConcernType = require('../models/ConcernType'); // Correct path to ConcernType model

// Example route to create a new maintenance request
router.post('/maintenance-request', async (req, res) => {
  try {
    const maintenanceRequest = new MaintenanceRequest(req.body);
    await maintenanceRequest.save();
    res.status(201).send(maintenanceRequest);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Example route to get all maintenance requests
router.get('/maintenance-requests', async (req, res) => {
  try {
    const maintenanceRequests = await MaintenanceRequest.find().populate('concernType').populate('notes.author');
    res.status(200).send(maintenanceRequests);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;