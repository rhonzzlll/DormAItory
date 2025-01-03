const express = require('express');
const router = express.Router();
const { PaymentRecord } = require('../models/Payment');

// Get all payment records
router.get('/', async (req, res) => {
  try {
    const paymentRecords = await PaymentRecord.find();
    res.json(paymentRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new payment record
router.post('/', async (req, res) => {
  try {
    const paymentRecord = new PaymentRecord(req.body);
    const newPaymentRecord = await paymentRecord.save();
    res.status(201).json(newPaymentRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a payment record
router.put('/:id', async (req, res) => {
  try {
    const updatedRecord = await PaymentRecord.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    if (!updatedRecord) {
      return res.status(404).json({ message: 'Payment record not found' });
    }
    
    res.json(updatedRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a payment record
router.delete('/:id', async (req, res) => {
  try {
    const deletedRecord = await PaymentRecord.findByIdAndDelete(req.params.id);
    
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Payment record not found' });
    }
    
    res.json({ message: 'Payment record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;