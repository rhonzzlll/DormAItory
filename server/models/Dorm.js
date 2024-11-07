const mongoose = require('mongoose');

const dormSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  occupied: { type: Number, default: 0, required: false },
  price: { type: Number, required: true },
  amenities: {
    aircon: { type: Boolean, default: false, required: true },
    wifi: { type: Boolean, default: false, required: true },
    bathroom: { type: Boolean, default: false, required: true },
  },
  description: { type: String, default: '' },
  images: { type: [String], default: [] },
});

module.exports = mongoose.model('Dorm', dormSchema);