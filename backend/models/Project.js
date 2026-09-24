const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    filterId: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    image: { type: String, default: 'assets/projects/placeholder.jpg' },
    liveLink: { type: String, default: '#' },
    githubLink: { type: String, default: '#' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
