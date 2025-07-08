const mongoose = require('mongoose');

const roomChangeHistorySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromRoom: String,
  toRoom: String,
  changeDate: { type: Date, default: Date.now },
  moveInDate: Date,
  moveOutDate: Date,
  changedBy: String // admin or system
});

module.exports = mongoose.model('RoomChangeHistory', roomChangeHistorySchema);