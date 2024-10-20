const mongoose = require('mongoose');

const dormSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupied: { type: Number, required: true },
  price: { type: Number, required: true },
  amenities: {
    aircon: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    bathroom: { type: Boolean, default: false },
  },
  description: { type: String, default: '' },
  images: { type: [String], default: [] },
});

module.exports = mongoose.model('Dorm', dormSchema);