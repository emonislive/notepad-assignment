const User = require('../models/User');
const Note = require('../models/Note');
const Post = require('../models/Post');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

/**
 * List all users with pagination. (Admin only)
 * Supported by index: { createdAt: -1 } on User collection.
 */
const listUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [users, totalCount] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);

    res.status(200).json(paginatedResponse(users, totalCount, page, limit));
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific user by ID. (Admin only or user viewing self)
 * Supported by default unique primary index on _id.
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a new user. (Admin only)
 */
const createUser = async (req, res, next) => {
  try {
    const { username, email, password, role, interests } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'Email is already in use.' });
    }

    const user = new User({
      username,
      email,
      password,
      role: role || 'user',
      interests: Array.isArray(interests) ? interests.map((i) => String(i).trim()) : [],
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing user. (Admin only)
 */
const updateUser = async (req, res, next) => {
  try {
    const { username, email, role, interests, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email.toLowerCase();
    if (role !== undefined) user.role = role;
    if (interests !== undefined && Array.isArray(interests)) {
      user.interests = interests.map((i) => String(i).trim());
    }
    if (password) {
      user.password = password; // Will be hashed via pre('save')
    }

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a user. (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent admin from deleting their own account accidentally
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ error: 'Cannot delete your own admin account.' });
    }

    // Cascade delete associated notes and posts
    await Promise.all([
      user.deleteOne(),
      Note.deleteMany({ owner: user._id }),
      Post.deleteMany({ author: user._id }),
    ]);

    res.status(200).json({ message: 'User and associated data removed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
