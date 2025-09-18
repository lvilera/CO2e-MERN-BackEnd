const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Add User
router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, password, city, state, country } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            ...(city && { city }),
            ...(state && { state }),
            ...(country && { country })
        });
        await newUser.save();
        res.status(201).json({ message: 'User added successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Get all Users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({ role: "user" }, { password: 0 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete User by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update User
router.put('/:id', async (req, res) => {
    try {
        const { firstName, lastName, email, password, city, state, country } = req.body;
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (email) {
            const existing = await User.findOne({ email });
            if (existing && existing._id.toString() !== user._id.toString()) {
                return res.status(409).json({ message: 'Email already registered.' });
            }
        }

        const updateFields = {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(email && { email }),
            ...(city && { city }),
            ...(state && { state }),
            ...(country && { country })
        };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.password = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true }
        )

        const userObj = updatedUser.toObject();
        delete userObj.password;

        res.json(userObj);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 