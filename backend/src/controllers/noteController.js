const Note = require('../models/Note');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

/**
 * Create a new note.
 */
const createNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const note = new Note({
      title,
      content,
      owner: req.user._id,
    });

    await note.save();
    res.status(201).json({ message: 'Note created successfully', note });
  } catch (err) {
    next(err);
  }
};

/**
 * List notes with pagination.
 * - Regular users: view their own notes (supported by index: { owner: 1, createdAt: -1 })
 * - Admin users: can view everyone's notes (all=true) or their own notes (supported by index: { createdAt: -1 })
 */
const getNotes = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const viewAll = req.user.role === 'admin' && req.query.all === 'true';

    const filter = viewAll ? {} : { owner: req.user._id };

    const [notes, totalCount] = await Promise.all([
      Note.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('owner', 'username email role')
        .lean(),
      Note.countDocuments(filter),
    ]);

    res.status(200).json(paginatedResponse(notes, totalCount, page, limit));
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch a single note by ID.
 * - Users can only view their own notes.
 * - Admins can view everyone's notes.
 * (Supported by default unique primary index on _id).
 */
const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id).populate('owner', 'username email role');
    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    if (req.user.role !== 'admin' && !note.owner._id.equals(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this note.' });
    }

    res.status(200).json({ note });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a note.
 * Users can update their own notes. Admins inherit user capabilities.
 */
const updateNote = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    if (req.user.role !== 'admin' && !note.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own notes.' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    await note.save();
    res.status(200).json({ message: 'Note updated successfully', note });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a note.
 * Users can delete their own notes. Admins inherit user capabilities.
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }

    if (req.user.role !== 'admin' && !note.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own notes.' });
    }

    await note.deleteOne();
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
