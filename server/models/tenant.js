const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  roomId: { type: mongoose.Types.ObjectId, ref: "Dorm", required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  rentAmount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  paymentStatus: { type: String, required: true }
});

const Tenant = mongoose.model("Tenant", tenantSchema);

module.exports = Tenant;