const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Enhanced user registration with validation and security
const registerUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    studentId,
    class: studentClass
  } = req.body;

  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      message: 'Please provide name, email, password, and role'
    });
  }

  try {
    // Check if user exists by email or studentId
    const userExists = await User.findOne({
      $or: [{
        email
      }, {
        studentId
      }]
    });
    if (userExists) {
      return res.status(400).json({
        message: 'User with this email or student ID already exists'
      });
    }

    // Securely hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      studentId,
      class: studentClass,
    });

    if (user) {
      // Return a clean user object with a JWT token
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({
        message: 'Invalid user data provided'
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      message: 'Server error during registration'
    });
  }
};

// Secure and role-based login
const loginUser = async (req, res) => {
  const {
    studentId, 
    email, 
    password, 
    role
  } = req.body;

  // Validate required fields based on role
  if (!password || !role) {
    return res.status(400).json({
      message: 'Role and password are required'
    });
  }

  if ((role === 'student' && !studentId) || (role === 'parent' && !email) || (role === 'admin' && !email)) {
    return res.status(400).json({
      message: 'Please provide the correct identifier for your role (Student ID or Email)'
    });
  }

  try {
    let user;
    // Find user based on role
    if (role === 'student') {
      user = await User.findOne({
        studentId
      });
    } else {
      user = await User.findOne({
        email
      });
    }

    // Verify user and password, and check role alignment
    if (user && user.role === role && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        balance: user.balance,
        token: generateToken(user._id, user.role),
      });
    } else {
      // Generic message to prevent user enumeration
      res.status(401).json({
        message: 'Invalid credentials or role mismatch'
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
};

// Generate a JWT with user ID and role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: role === 'admin' ? '8h' : '24h', // Shorter session for admin
  });
};

module.exports = {
  registerUser,
  loginUser
};