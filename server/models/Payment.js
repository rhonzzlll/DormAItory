// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Fields for payment methods
  name: { type: String }, // Payment method name
  accountName: { type: String }, // Account name for payment method
  accountNumber: { type: String }, // Account number for payment method
  imageUrl: { type: String }, // Image URL for payment method

  // Fields for payment records
  fullName: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  amount: { type: Number }, // Payment amount
  screenshotUrl: { type: String }, // URL of payment screenshot
  referenceNumber: { type: String }, // Payment reference number
  date: { type: Date, default: Date.now }, // Date of payment
});

module.exports = mongoose.model('Payment', paymentSchema);
