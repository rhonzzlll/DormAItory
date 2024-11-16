const express = require('express');
const router = express.Router();
const maintenanceRequestController = require('../controllers/maintenanceRequestController');

// Define routes and attach controller methods
router.get('/get', maintenanceRequestController.getAllRequests);
router.get('/delete/:id', maintenanceRequestController.deleteRequest);
router.post('/send', maintenanceRequestController.sendRequest);
router.post('/create', maintenanceRequestController.createRequest);
router.post('/update', maintenanceRequestController.updateRequest);
router.post('/update/status', maintenanceRequestController.updateRequestStatus);

module.exports = router;