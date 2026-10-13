const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    filename: { 
        type: String, 
        default: 'resume.pdf' 
    },
    contentType: { 
        type: String, 
        default: 'application/pdf' 
    },
    data: { 
        type: Buffer, 
        required: true 
    },
    size: { 
        type: Number 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Resume', resumeSchema);
