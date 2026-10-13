const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Certification = require('../models/Certification');
const Profile = require('../models/Profile');
const Education = require('../models/Education');
const Resume = require('../models/Resume');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for resume upload (memory storage to persist in MongoDB)
const resumeMemoryStorage = multer.memoryStorage();
const uploadResume = multer({
    storage: resumeMemoryStorage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
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

// Configure Multer for profile image
const profileImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../assets'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, 'profile' + ext);
    }
});

const uploadProfileImage = multer({
    storage: profileImageStorage,
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
        let profile = await Profile.findOne();
        let profileData = profile ? profile.toObject() : {};

        // Attach dynamic resume info if present in MongoDB
        const resumeDoc = await Resume.findOne().select('updatedAt filename');
        if (resumeDoc) {
            profileData.hasCustomResume = true;
            profileData.resumeUpdatedAt = resumeDoc.updatedAt;
        }
        if (!profileData.resumeLink || profileData.resumeLink.includes('/api/resume')) {
            profileData.resumeLink = 'assets/resume.pdf';
        }

        res.json(profileData);
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
// Resume Upload & Serving Routes
router.post('/upload/resume', protect, uploadResume.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded or invalid file type. Please upload a PDF.' });
        }

        // 1. Save locally as fallback if local assets folder exists
        try {
            const localAssetsDir = path.join(__dirname, '../../assets');
            if (fs.existsSync(localAssetsDir)) {
                fs.writeFileSync(path.join(localAssetsDir, 'resume.pdf'), req.file.buffer);
            }
        } catch (fsErr) {
            console.warn('Could not write to local filesystem:', fsErr.message);
        }

        // 2. Save or update PDF buffer directly in MongoDB Atlas (persists across Render restarts)
        let resumeDoc = await Resume.findOne();
        if (resumeDoc) {
            resumeDoc.filename = req.file.originalname || 'resume.pdf';
            resumeDoc.contentType = req.file.mimetype || 'application/pdf';
            resumeDoc.data = req.file.buffer;
            resumeDoc.size = req.file.size;
            resumeDoc.updatedAt = new Date();
            await resumeDoc.save();
        } else {
            resumeDoc = await Resume.create({
                filename: req.file.originalname || 'resume.pdf',
                contentType: req.file.mimetype || 'application/pdf',
                data: req.file.buffer,
                size: req.file.size,
                updatedAt: new Date()
            });
        }

        const resumeUrl = `/api/resume?v=${resumeDoc.updatedAt.getTime()}`;

        // 3. Update Profile model with the resumeLink
        let profile = await Profile.findOne();
        if (profile) {
            profile.resumeLink = 'assets/resume.pdf';
            await profile.save();
        }

        res.status(200).json({ 
            message: 'Resume uploaded successfully!', 
            url: resumeUrl,
            filename: resumeDoc.filename,
            updatedAt: resumeDoc.updatedAt
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ message: 'Server error during upload: ' + error.message });
    }
});

// Serve dynamic PDF resume from MongoDB or fallback to static file
router.get('/resume', async (req, res) => {
    try {
        const resumeDoc = await Resume.findOne();
        if (resumeDoc && resumeDoc.data) {
            const isDownload = req.query.download === 'true';
            const filename = resumeDoc.filename || 'Sivanesan_S_Resume.pdf';
            res.setHeader('Content-Type', resumeDoc.contentType || 'application/pdf');
            res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${filename}"`);
            res.setHeader('Cache-Control', 'public, max-age=60');
            return res.send(resumeDoc.data);
        }

        // Fallback: check if local assets/resume.pdf exists
        const localPath = path.join(__dirname, '../../assets/resume.pdf');
        if (fs.existsSync(localPath)) {
            const isDownload = req.query.download === 'true';
            if (isDownload) {
                return res.download(localPath, 'Sivanesan_S_Resume.pdf');
            }
            return res.sendFile(localPath);
        }

        res.status(404).send('Resume not found');
    } catch (error) {
        console.error('Error serving resume:', error);
        res.status(500).send('Server error retrieving resume');
    }
});

// Resume metadata endpoint for admin checking
router.get('/resume/info', async (req, res) => {
    try {
        const resumeDoc = await Resume.findOne().select('filename size updatedAt contentType');
        if (resumeDoc) {
            return res.json({
                exists: true,
                filename: resumeDoc.filename,
                size: resumeDoc.size,
                updatedAt: resumeDoc.updatedAt,
                url: `/api/resume?v=${new Date(resumeDoc.updatedAt).getTime()}`
            });
        }
        res.json({ exists: false });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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

router.post('/upload/profile-image', protect, uploadProfileImage.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }
        const imageUrl = 'assets/' + req.file.filename;
        let profile = await Profile.findOne();
        if (profile) {
            profile.profileImage = imageUrl;
            await profile.save();
        } else {
            profile = await Profile.create({
                name: 'Sivanesan S',
                role: 'Full Stack Developer',
                aboutText: '',
                profileImage: imageUrl
            });
        }
        res.status(200).json({ message: 'Profile picture updated successfully', imageUrl: imageUrl });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ message: 'Server error during profile image upload' });
    }
});

module.exports = router;
