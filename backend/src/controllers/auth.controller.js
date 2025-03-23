const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Register a new user
const register = async (req, res) => {
  try {
    const { userId, name, email, password, role, contactInfo, mentorCode, adminCode } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { userId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or student ID' });
    }

    // Create new user
    const user = await User.create({
      userId,
      name,
      email,
      password,
      role,
      contactInfo,
      mentorCode,
      adminCode,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    // Send back the specific error message for mentor code validation
    if (error.message.includes('Invalid mentor code')) {
      return res.status(400).json({ message: 'Invalid mentor code' });
    }
    // Send back the specific error message for admin code validation
    if (error.message.includes('Invalid admin code')) {
      return res.status(400).json({ message: 'Invalid admin code' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  register,
  login,
  getProfile,
};
