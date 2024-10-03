const mongoose = require('mongoose');
const Note = require('./note'); // Import the Note model

const maintenanceRequestSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    tenantId: {
        type: String,
        required: true,
    },
    floorNo: {
        type: String,
        required: true,
    },
    roomNo: {
        type: String,
        required: true,
    },
    roomLetter: String,
    concernType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ConcernType',
        required: true,
    },
    specificationOfConcern: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    dateSubmitted: {
        type: Date,
        default: Date.now,
    },
    notes: [Note.schema], // Use the note schema directly
});

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest;