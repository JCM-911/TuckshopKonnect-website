const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
  const { name, email, password, role, studentId, class: studentClass } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      studentId,
      class: studentClass,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { studentId, email, password } = req.body;

  if ((!studentId && !email) || !password) {
    return res.status(400).json({ message: 'Please provide login credentials and password' });
  }

  try {
    let user;

    if (studentId) {
      // Find user by studentId, case-insensitive for convenience
      user = await User.findOne({ studentId: { $regex: new RegExp(`^${studentId}$`, 'i') } });
    } else {
      // Find user by email, case-insensitive
      user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, 'your_jwt_secret', { // This secret should be in an environment variable
    expiresIn: '30d',
  });
};

module.exports = { registerUser, loginUser };
