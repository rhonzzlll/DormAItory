// routes/tenantRouter.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Adjust the path as needed

// Get all tenants
router.get('/', async (req, res) => {  // Changed '/tenants' to '/'
  try {
    const tenants = await User.find({ role: 'tenant' });
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
