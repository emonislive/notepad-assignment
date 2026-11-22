const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

/**
 * Scenario 1: Group by Interests
 * Context: User profiles contain a list of interests (e.g., ['chess', 'reading']).
 * Task: specific view to see users grouped by interests.
 * Constraint: You must use exactly one collection.aggregate() call. Do not use any other methods.
 * Supported by index: { interests: 1 } (multikey index on User collection)
 */
const getUsersByInterests = async (req, res, next) => {
  try {
    const result = await User.aggregate([
      // 1. Deconstruct the interests array so each interest produces an individual document
      { $unwind: '$interests' },
      // 2. Group documents by the interest value
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 },
          users: {
            $push: {
              _id: '$_id',
              username: '$username',
              email: '$email',
              role: '$role',
            },
          },
        },
      },
      // 3. Sort alphabetically by interest name
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      scenario: 'Scenario 1: Group by Interests',
      totalInterests: result.length,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Scenario 2: User Posts ($lookup)
 * Context: Users can write posts which are stored in a separate Posts collection.
 * Task: Retrieve all posts belonging to a particular user.
 * Constraint: Use a single aggregation pipeline with a $lookup stage.
 * Supported by indexes:
 *  - { author: 1, createdAt: -1 } on Post collection (for filtering and sorting)
 *  - default _id index on User collection (for the $lookup foreign join)
 */
const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // If query ?view=user, execute lookup from User to Posts
    if (req.query.view === 'user') {
      const userResult = await User.aggregate([
        { $match: { _id: userObjectId } },
        {
          $lookup: {
            from: 'posts',
            localField: '_id',
            foreignField: 'author',
            as: 'posts',
          },
        },
        {
          $project: {
            password: 0,
          },
        },
      ]);

      if (!userResult || userResult.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.status(200).json({
        scenario: 'Scenario 2: User Posts ($lookup from User)',
        user: userResult[0],
      });
    }

    // Default: Retrieve all posts belonging to the user with author details joined via $lookup
    const posts = await Post.aggregate([
      { $match: { author: userObjectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDetails',
        },
      },
      { $unwind: '$authorDetails' },
      {
        $project: {
          title: 1,
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          'authorDetails._id': 1,
          'authorDetails.username': 1,
          'authorDetails.email': 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json({
      scenario: 'Scenario 2: User Posts ($lookup from Post)',
      userId,
      count: posts.length,
      posts,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsersByInterests,
  getUserPosts,
};
