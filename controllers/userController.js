const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// @desc    Get all users (or filter by role)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  try {
    const users = await User.find(filter).select('-password').populate('children');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new user (parent or student)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    const { name, email, password, role, studentId, parentId, class: studentClass, balance } = req.body;

    if (!name || !role) {
        return res.status(400).json({ message: 'Name and role are required.' });
    }

    try {
        let existingUser = null;
        if (email) {
            existingUser = await User.findOne({ email });
        } else if (studentId) {
            existingUser = await User.findOne({ studentId });
        } else if (parentId) {
            existingUser = await User.findOne({ parentId });
        }

        if (existingUser) {
            return res.status(400).json({ message: 'User with that email or ID already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'password123', salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            studentId,
            parentId,
            class: studentClass,
            balance: balance || 0
        });

        if (role === 'student' && req.body.parent) {
            await User.findByIdAndUpdate(req.body.parent, { $push: { children: newUser._id } });
        }

        res.status(201).json(newUser);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user.' });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.studentId = req.body.studentId || user.studentId;
            user.parentId = req.body.parentId || user.parentId;
            user.class = req.body.class || user.class;
            user.balance = req.body.balance !== undefined ? req.body.balance : user.balance;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating user.' });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // If a parent is deleted, handle their children (e.g., reassign or delete)
            // For now, we'll just remove the parent
            await user.remove();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user.' });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
