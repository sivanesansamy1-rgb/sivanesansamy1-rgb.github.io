const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    category: { type: String, required: true },
    name: { type: String, required: true },
    percentage: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
