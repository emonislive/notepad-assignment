const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Register a new user account.
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password, interests, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered.' });
    }

    // Role safety: Only create regular 'user' by default via public registration unless specified otherwise
    const assignedRole = role === 'admin' ? 'admin' : 'user';

    const user = new User({
      username,
      email,
      password,
      role: assignedRole,
      interests: Array.isArray(interests) ? interests.map((i) => String(i).trim()) : [],
    });

    await user.save();

    const token = signToken(user);
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Log in with existing credentials.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.status(200).json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current authenticated user profile.
 */
const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
