const mongoose = require('mongoose');

const concernTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
});
 

module.exports = ConcernType;
