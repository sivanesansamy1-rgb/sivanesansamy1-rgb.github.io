const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Certification = require('../models/Certification');
const Profile = require('../models/Profile');
const Education = require('../models/Education');
const multer = require('multer');
const path = require('path');

// Configure Multer for resume upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save to frontend assets folder (relative to backend/routes/)
        cb(null, path.join(__dirname, '../../assets'));
    },
    filename: function (req, file, cb) {
        cb(null, 'resume.pdf'); // Always overwrite the exact same file
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

// Configure Multer for project images
const projectImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../assets/projects'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadProjectImage = multer({
    storage: projectImageStorage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// ==========================================
// PROFILE ROUTES
// ==========================================
router.get('/profile', async (req, res) => {
    try {
        const profile = await Profile.findOne();
        res.json(profile || {});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/profile', protect, async (req, res) => {
    try {
        let profile = await Profile.findOne();
        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate({}, req.body, { new: true });
            res.json(profile);
        } else {
            // Create
            profile = await Profile.create(req.body);
            res.status(201).json(profile);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================================
// GENERIC CRUD GENERATOR FOR COLLECTIONS
// ==========================================
const createCrudRoutes = (path, Model) => {
    // GET all
    router.get(path, async (req, res) => {
        try {
            const data = await Model.find().sort({ _id: 1 });
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    // POST create new
    router.post(path, protect, async (req, res) => {
        try {
            const data = await Model.create(req.body);
            res.status(201).json(data);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data' });
        }
    });

    // PUT update
    router.put(`${path}/:id`, protect, async (req, res) => {
        try {
            const data = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!data) return res.status(404).json({ message: 'Not found' });
            res.json(data);
        } catch (error) {
            res.status(400).json({ message: 'Invalid data' });
        }
    });

    // DELETE
    router.delete(`${path}/:id`, protect, async (req, res) => {
        try {
            const data = await Model.findById(req.params.id);
            if (!data) return res.status(404).json({ message: 'Not found' });
            await Model.deleteOne({ _id: req.params.id });
            res.json({ message: 'Removed successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
};

createCrudRoutes('/projects', Project);
createCrudRoutes('/skills', Skill);
createCrudRoutes('/experience', Experience);
createCrudRoutes('/certifications', Certification);
createCrudRoutes('/education', Education);

// ==========================================
// FILE UPLOAD ROUTES
// ==========================================
router.post('/upload/resume', protect, upload.single('resume'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded or invalid file type' });
        }
        res.status(200).json({ message: 'Resume uploaded successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during upload' });
    }
});

router.post('/upload/project-image', protect, uploadProjectImage.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        res.status(200).json({ imageUrl: 'assets/projects/' + req.file.filename });
    } catch (error) {
        res.status(500).json({ message: 'Server error during image upload' });
    }
});

module.exports = router;
