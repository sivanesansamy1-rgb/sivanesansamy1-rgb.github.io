const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    organization: { type: String, required: true },
    date: { type: String, required: true },
    icon: { type: String, default: 'fa-certificate' },
    link: { type: String, default: '#' }
}, { timestamps: true });

module.exports = mongoose.model('Certification', certificationSchema);
