const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');

// All note routes require authentication
router.use(authenticate);

// List notes (supports pagination; users see own notes, admin can view all via ?all=true)
router.get('/', noteController.getNotes);

// Create note
router.post('/', noteController.createNote);

// Get specific note by ID (read operation supported by primary index)
router.get('/:id', noteController.getNoteById);

// Update note (users can update their own notes, admins inherit user capabilities)
router.put('/:id', noteController.updateNote);

// Delete note (users can delete their own notes, admins inherit user capabilities)
router.delete('/:id', noteController.deleteNote);

module.exports = router;
