const PaymentRecord = require('../models/PaymentRecord');

exports.getAllPaymentRecords = async (req, res) => {
  try {
    const paymentRecords = await PaymentRecord.find().populate('paymentMethod');
    res.json(paymentRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPaymentRecord = async (req, res) => {
  try {
    const paymentRecord = new PaymentRecord(req.body);
    const newPaymentRecord = await paymentRecord.save();
    res.status(201).json(newPaymentRecord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updatePaymentRecord = async (req, res) => {
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
};

exports.deletePaymentRecord = async (req, res) => {
  try {
    const deletedRecord = await PaymentRecord.findByIdAndDelete(req.params.id);
    
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Payment record not found' });
    }
    
    res.json({ message: 'Payment record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// routes/paymentMethodRoutes.js
const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');

router.get('/', paymentMethodController.getAllPaymentMethods);
router.post('/', paymentMethodController.createPaymentMethod);
router.put('/:id', paymentMethodController.updatePaymentMethod);
router.delete('/:id', paymentMethodController.deletePaymentMethod);

module.exports = router;