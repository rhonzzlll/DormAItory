const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  visitDate: { type: Date, required: true },
  arrivalTime: { type: String, required: true },
  departureTime: { type: String },
  purpose: { type: String },
  items: { type: String },
  specialInstructions: { type: String },
  agreeToPolicy: { type: Boolean, required: true },
  visitors: [{
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
    relationship: { type: String, required: true },
  }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' } // Add status field
});

module.exports = mongoose.model('Form', formSchema);