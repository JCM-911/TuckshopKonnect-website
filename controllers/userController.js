const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Enhanced function to get users with better filtering and pagination
const getUsers = async (req, res) => {
  const { role, page = 1, limit = 10 } = req.query;
  const filter = role ? { role } : {};
  
  try {
    const users = await User.find(filter)
      .select('-password') // Exclude password from the result
      .populate('children', 'name studentId class') // Populate children with specific fields
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

// Securely create a new user with robust validation
const createUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    studentId,
    class: studentClass,
    balance,
    parentId // The ID of the parent for a student user
  } = req.body;

  // Role-specific validation
  if (!name || !role) {
    return res.status(400).json({ message: 'Name and role are required.' });
  }
  if (role === 'student' && !studentId) {
    return res.status(400).json({ message: 'Student ID is required for student role.' });
  } 
  if ((role === 'parent' || role === 'admin') && !email) {
    return res.status(400).json({ message: 'Email is required for this role.' });
  }
  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or student ID already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      studentId,
      class: studentClass,
      balance: balance || 0,
    });

    // If a student is created with a parentId, link them
    if (role === 'student' && parentId) {
      await User.findByIdAndUpdate(parentId, { $push: { children: newUser._id } });
    }

    res.status(201).json({ user: newUser, message: 'User created successfully.' });

  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
};

// Efficiently update a user
const updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If password is being updated, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser, message: 'User updated successfully.' });

  } catch (error) {
    console.error('Update User Error:', error);
    res.status(500).json({ message: 'Error updating user.' });
  }
};

// Safely delete a user and handle their associations
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If a parent is deleted, handle their children
    if (user.role === 'parent' && user.children && user.children.length > 0) {
        // Option 1: Delete children
        await User.deleteMany({ _id: { $in: user.children } });
        // Option 2: Set children's parent to null (if schema allows)
        // await User.updateMany({ _id: { $in: user.children } }, { $unset: { parentId: '' } });
    }

    // If a student is deleted, remove them from their parent's children list
    if (user.role === 'student') {
        await User.updateMany({ children: user._id }, { $pull: { children: user._id } });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and associated data removed successfully.' });

  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Error deleting user.' });
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };