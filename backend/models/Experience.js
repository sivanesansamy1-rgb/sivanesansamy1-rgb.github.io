const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    organization: { type: String, required: true },
    date: { type: String, required: true },
    mode: { type: String, default: '' },
    description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);
