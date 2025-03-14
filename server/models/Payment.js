const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  // Fields for payment methods
  name: { type: String, required: true }, // Payment method name
  accountName: { type: String, required: true }, // Account name for payment method
  accountNumber: { type: String, required: true }, // Account number for payment method
  imageUrl: { type: String }, // Image URL for payment method

  // Fields for payment records
  amount: { type: Number }, // Payment amount
  referenceNumber: { type: String }, // Reference number for payment
  screenshotUrl: { type: String }, // Screenshot URL for payment
  paymentMethod: { type: String }, // Payment method used
  fullName: { type: String }, // Full name of the payer
  roomNumber: { type: String }, // Room number of the payer
  date: { type: Date, default: Date.now } // Date of payment
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);