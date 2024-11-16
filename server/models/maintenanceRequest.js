const mongoose = require('mongoose');
const Note = require('./note'); // Import the Note model

const maintenanceRequestSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Types.ObjectId, ref: "Tenant", required: true },
    concernType: { type: String, required: true },
    specificationOfConcern: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending',
        required: true
    }
}, { timestamps: true });

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest;