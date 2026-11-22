const User = require('../src/models/User');
const Note = require('../src/models/Note');
const Post = require('../src/models/Post');

describe('Database Indexing Strategy & Optimization Verification', () => {
  describe('User Model Indexes', () => {
    test('defines strictly required indexes via schema.index', () => {
      const indexes = User.schema.indexes();

      // Convert indexes to a readable format
      const indexDefinitions = indexes.map(([fields, options]) => ({
        fields,
        options: options || {},
      }));

      // 1. Email unique index
      const emailIndex = indexDefinitions.find((idx) => idx.fields.email === 1);
      expect(emailIndex).toBeDefined();
      expect(emailIndex.options.unique).toBe(true);

      // 2. CreatedAt index for admin user listing pagination
      const createdAtIndex = indexDefinitions.find((idx) => idx.fields.createdAt === -1);
      expect(createdAtIndex).toBeDefined();

      // 3. Multikey interests index for Scenario 1 Aggregation
      const interestsIndex = indexDefinitions.find((idx) => idx.fields.interests === 1);
      expect(interestsIndex).toBeDefined();

      // 4. Critical Constraint: DO NOT MAKE ANY UNNECESSARY INDEXES
      // Only 3 explicit secondary indexes should exist on User schema
      expect(indexes.length).toBe(3);
    });
  });

  describe('Note Model Indexes', () => {
    test('defines strictly required compound and sort indexes via schema.index', () => {
      const indexes = Note.schema.indexes();

      const indexDefinitions = indexes.map(([fields, options]) => ({
        fields,
        options: options || {},
      }));

      // 1. Compound index on (owner, createdAt) for user listing notes with sorted pagination (ESR rule)
      const userNotesCompoundIndex = indexDefinitions.find(
        (idx) => idx.fields.owner === 1 && idx.fields.createdAt === -1
      );
      expect(userNotesCompoundIndex).toBeDefined();

      // 2. Single field index on createdAt for admin listing all notes with sorted pagination
      const allNotesIndex = indexDefinitions.find(
        (idx) => idx.fields.createdAt === -1 && Object.keys(idx.fields).length === 1
      );
      expect(allNotesIndex).toBeDefined();

      // 3. Critical Constraint: Zero unnecessary indexes (exactly 2 secondary indexes)
      expect(indexes.length).toBe(2);
    });
  });

  describe('Post Model Indexes', () => {
    test('defines strictly required indexes for Scenario 2 aggregation and public list', () => {
      const indexes = Post.schema.indexes();

      const indexDefinitions = indexes.map(([fields, options]) => ({
        fields,
        options: options || {},
      }));

      // 1. Compound index on (author, createdAt) supporting Scenario 2 ($lookup/retrieve posts of user)
      const authorCompoundIndex = indexDefinitions.find(
        (idx) => idx.fields.author === 1 && idx.fields.createdAt === -1
      );
      expect(authorCompoundIndex).toBeDefined();

      // 2. Index on createdAt supporting public list pagination
      const createdAtIndex = indexDefinitions.find(
        (idx) => idx.fields.createdAt === -1 && Object.keys(idx.fields).length === 1
      );
      expect(createdAtIndex).toBeDefined();

      // 3. Critical Constraint: Zero unnecessary indexes (exactly 2 secondary indexes)
      expect(indexes.length).toBe(2);
    });
  });
});
