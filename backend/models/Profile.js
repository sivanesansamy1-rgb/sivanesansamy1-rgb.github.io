const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    aboutText: { type: String, required: true },
    email: { type: String },
    location: { type: String },
    linkedin: { type: String },
    github: { type: String },
    resumeLink: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
