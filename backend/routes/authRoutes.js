const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/login
// @desc    Auth admin & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            res.json({
                _id: admin._id,
                email: admin.email,
                token: generateToken(admin._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/setup (TEMPORARY: Run once to create admin user)
// @desc    Create initial admin
// @access  Public
router.post('/setup', async (req, res) => {
    try {
        const adminExists = await Admin.findOne({ email: 'admin@example.com' });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const admin = await Admin.create({
            email: 'admin@example.com',
            password: 'admin123'
        });
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
