const mongoose = require('mongoose');
const User = require('../src/models/User');
const Post = require('../src/models/Post');
const { getUsersByInterests, getUserPosts } = require('../src/controllers/aggregationController');

describe('MongoDB Aggregation Pipeline Constraints', () => {
  describe('Scenario 1: Group by Interests', () => {
    test('executes exactly one User.aggregate() call with $unwind, $group, and $sort', async () => {
      let capturedPipeline = null;

      const aggregateSpy = jest.spyOn(User, 'aggregate').mockImplementation((pipeline) => {
        capturedPipeline = pipeline;
        return Promise.resolve([
          { _id: 'chess', count: 2, users: [{ username: 'alice' }, { username: 'bob' }] },
          { _id: 'reading', count: 1, users: [{ username: 'alice' }] },
        ]);
      });

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await getUsersByInterests(req, res, next);

      // Verify exactly one collection.aggregate() call was made
      expect(aggregateSpy).toHaveBeenCalledTimes(1);

      // Verify the pipeline stages
      expect(capturedPipeline).toBeDefined();
      expect(capturedPipeline.length).toBe(3);

      // Stage 1: $unwind interests array
      expect(capturedPipeline[0]).toEqual({ $unwind: '$interests' });

      // Stage 2: $group by $interests
      expect(capturedPipeline[1].$group).toBeDefined();
      expect(capturedPipeline[1].$group._id).toBe('$interests');
      expect(capturedPipeline[1].$group.count).toEqual({ $sum: 1 });

      // Stage 3: $sort
      expect(capturedPipeline[2]).toEqual({ $sort: { _id: 1 } });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          scenario: 'Scenario 1: Group by Interests',
          totalInterests: 2,
        })
      );

      aggregateSpy.mockRestore();
    });
  });

  describe('Scenario 2: User Posts ($lookup)', () => {
    test('executes a single aggregation pipeline with a $lookup stage', async () => {
      const validUserId = new mongoose.Types.ObjectId();
      let capturedPipeline = null;

      const aggregateSpy = jest.spyOn(Post, 'aggregate').mockImplementation((pipeline) => {
        capturedPipeline = pipeline;
        return Promise.resolve([
          {
            _id: new mongoose.Types.ObjectId(),
            title: 'First Post',
            content: 'Hello world',
            authorDetails: { username: 'alice', email: 'alice@example.com' },
          },
        ]);
      });

      const req = {
        params: { userId: validUserId.toString() },
        query: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await getUserPosts(req, res, next);

      // Verify single aggregation pipeline call
      expect(aggregateSpy).toHaveBeenCalledTimes(1);

      // Verify stages
      expect(capturedPipeline).toBeDefined();

      // Check $match stage
      const matchStage = capturedPipeline.find((s) => s.$match);
      expect(matchStage).toBeDefined();
      expect(matchStage.$match.author.toString()).toBe(validUserId.toString());

      // Check $lookup stage
      const lookupStage = capturedPipeline.find((s) => s.$lookup);
      expect(lookupStage).toBeDefined();
      expect(lookupStage.$lookup.from).toBe('users');
      expect(lookupStage.$lookup.localField).toBe('author');
      expect(lookupStage.$lookup.foreignField).toBe('_id');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          scenario: 'Scenario 2: User Posts ($lookup from Post)',
          count: 1,
        })
      );

      aggregateSpy.mockRestore();
    });
  });
});
