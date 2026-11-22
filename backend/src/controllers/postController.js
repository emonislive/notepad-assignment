const Post = require('../models/Post');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

/**
 * Create a new post. (Users can write posts)
 */
const createPost = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const post = new Post({
      title,
      content,
      author: req.user._id,
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (err) {
    next(err);
  }
};

/**
 * List all posts with pagination. (Posts are visible to everyone)
 * Supported by index: { createdAt: -1 } on Post collection.
 */
const getPosts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const [posts, totalCount] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'username email')
        .lean(),
      Post.countDocuments(),
    ]);

    res.status(200).json(paginatedResponse(posts, totalCount, page, limit));
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single post by ID.
 */
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username email');
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
};
