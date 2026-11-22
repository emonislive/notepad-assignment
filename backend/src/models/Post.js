const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must have an author'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes defined explicitly via schema.index per assessment requirements
// 1. Compound index on (author, createdAt) to support Aggregation Scenario 2 ($lookup/retrieve posts of a user)
postSchema.index({ author: 1, createdAt: -1 });

// 2. Index on createdAt to support listing all public posts with sorted pagination
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
