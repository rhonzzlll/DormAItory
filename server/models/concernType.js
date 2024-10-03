const mongoose = require('mongoose');

const concernTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
});

const ConcernType = require('../models/ConcernType');

module.exports = ConcernType;
