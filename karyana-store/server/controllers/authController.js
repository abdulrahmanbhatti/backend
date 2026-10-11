const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'karyana_super_secret_jwt_key_2026_pakistan', {
    expiresIn: '30d'
  });
};

// @desc Login user & get token
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact store owner.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get current logged in user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Get all staff users (Admin only)
// @route GET /api/auth/staff
const getStaff = async (req, res) => {
  try {
    const staff = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Create new staff member (Admin only)
// @route POST /api/auth/staff
const createStaff = async (req, res) => {
  try {
    const { username, password, name, role, phone } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'Username, password, and name are required' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const newUser = await User.create({
      username: username.toLowerCase().trim(),
      password,
      name: name.trim(),
      role: role || 'Cashier',
      phone: phone || '',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        status: newUser.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc Update staff member (Admin only)
// @route PUT /api/auth/staff/:id
const updateStaff = async (req, res) => {
  try {
    const { name, role, phone, status, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (status) user.status = status;
    if (password && password.trim().length >= 6) {
      user.password = password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  login,
  getMe,
  getStaff,
  createStaff,
  updateStaff
};
