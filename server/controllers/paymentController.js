const Payment = require('../models/Payment');

// Get all payment methods
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ name: { $exists: true } });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new payment method
exports.createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a payment method
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a payment method
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all payment records
exports.getPaymentRecords = async (req, res) => {
  try {
    const paymentRecords = await Payment.find({ fullName: { $exists: true } }).populate('fullName').populate('roomNumber');
    res.json(paymentRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new payment record
exports.createPaymentRecord = async (req, res) => {
  try {
    const { amount, referenceNumber, paymentMethod, fullName, roomNumber } = req.body;
    const screenshotUrl = req.file ? req.file.path : '';

    const paymentRecord = new Payment({
      amount,
      referenceNumber,
      screenshotUrl,
      paymentMethod,
      fullName,
      roomNumber,
    });

    await paymentRecord.save();
    res.status(201).json(paymentRecord);
  } catch (error) {
    console.error('Error creating payment record:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update a payment record
exports.updatePaymentRecord = async (req, res) => {
  try {
    const paymentRecord = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!paymentRecord) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    res.json(paymentRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a payment record
exports.deletePaymentRecord = async (req, res) => {
  try {
    const paymentRecord = await Payment.findByIdAndDelete(req.params.id);
    if (!paymentRecord) {
      return res.status(404).json({ error: 'Payment record not found' });
    }
    res.json({ message: 'Payment record deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};