const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All user management routes require authentication
router.use(authenticate);

// Admin-only user management routes
// 1. List all users with pagination (supported by index: { createdAt: -1 })
router.get('/', requireAdmin, userController.listUsers);

// 2. Add a new user
router.post('/', requireAdmin, userController.createUser);

// 3. Get user by ID (admin, or user checking their own info)
router.get('/:id', userController.getUserById);

// 4. Update user
router.put('/:id', requireAdmin, userController.updateUser);

// 5. Remove user
router.delete('/:id', requireAdmin, userController.deleteUser);

module.exports = router;
