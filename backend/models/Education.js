const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    degree: { type: String, required: true },
    major: { type: String, required: true },
    university: { type: String, required: true },
    status: { type: String },
    year: { type: String },
    coursework: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
