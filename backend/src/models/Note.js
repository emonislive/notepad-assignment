const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Note must have an owner'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes defined explicitly via schema.index per assessment requirements
// 1. Compound index on (owner, createdAt) for user listing their own notes with sorted pagination (ESR rule)
noteSchema.index({ owner: 1, createdAt: -1 });

// 2. Index on createdAt to support admin listing all notes with sorted pagination
noteSchema.index({ createdAt: -1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
