const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    query: { type: String, required: true },
    response: { type: String, required: true },
}, { timestaps: true });

const Prompt = mongoose.model('Prompt', promptSchema);

module.exports = Prompt;