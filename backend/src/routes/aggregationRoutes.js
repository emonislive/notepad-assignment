const express = require('express');
const router = express.Router();
const aggregationController = require('../controllers/aggregationController');

// Scenario 1: specific view to see users grouped by interests
// Constraint: exactly one collection.aggregate() call.
router.get('/group-by-interests', aggregationController.getUsersByInterests);

// Scenario 2: retrieve all posts belonging to a particular user
// Constraint: single aggregation pipeline with a $lookup stage.
router.get('/user-posts/:userId', aggregationController.getUserPosts);

module.exports = router;
