const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const aggregationController = require('../controllers/aggregationController');
const { authenticate } = require('../middleware/auth');

// Public route: list all posts with pagination (posts are visible to everyone)
router.get('/', postController.getPosts);

// Public route: Scenario 2: retrieve all posts belonging to a particular user using $lookup aggregation
router.get('/user/:userId', aggregationController.getUserPosts);

// Public route: get specific post by ID
router.get('/:id', postController.getPostById);

// Protected route: write a new post
router.post('/', authenticate, postController.createPost);

module.exports = router;
