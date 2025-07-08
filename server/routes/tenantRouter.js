const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const RoomChangeHistory = require('../models/RoomChangeHistory');

// Define routes and attach controller methods
router.post('/delete', tenantController.deleteTenant);
router.post('/create', tenantController.createTenant);
router.post('/update', tenantController.updateTenant);
router.get('/get/:id', tenantController.getTenant); // This should match the fetch URL
router.post('/move', tenantController.moveTenant);
router.post('/update-payment', tenantController.updatePaymentStatus);
router.post('/add-payment', async (req, res) => {
  // ...your logic here...
});

// Get room change history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await RoomChangeHistory.find({ userId: req.params.userId }).sort({ changeDate: 1 });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: 'Could not fetch room change history.' });
  }
});

module.exports = router;