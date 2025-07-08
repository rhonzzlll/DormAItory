const mongoose = require('mongoose');
 
const tenantSchema = new mongoose.Schema({
  roomId: { type: mongoose.Types.ObjectId, ref: "Dorm", required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  rentAmount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  paymentStatus: { type: String, required: true },
 payments: [{
  month: String,
  status: { type: String, enum: ['paid', 'pending'] },
  datePaid: Date,
  amount: Number
}]
});

// Check if the model already exists before defining it
module.exports = mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);