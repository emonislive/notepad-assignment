require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Note = require('./models/Note');
const Post = require('./models/Post');
const { connectDB, disconnectDB } = require('./config/db');

const seedData = async () => {
  try {
    console.log('Connecting to database to seed sample data...');
    await connectDB();

    console.log('Clearing existing records...');
    await Promise.all([User.deleteMany({}), Note.deleteMany({}), Post.deleteMany({})]);

    console.log('Creating sample users...');
    const adminUser = new User({
      username: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      interests: ['chess', 'reading', 'coding'],
    });

    const standardUser1 = new User({
      username: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'password123',
      role: 'user',
      interests: ['chess', 'gaming'],
    });

    const standardUser2 = new User({
      username: 'Bob Smith',
      email: 'bob@example.com',
      password: 'password123',
      role: 'user',
      interests: ['reading', 'music', 'coding'],
    });

    await Promise.all([adminUser.save(), standardUser1.save(), standardUser2.save()]);

    console.log('Creating sample notes...');
    await Note.create([
      {
        title: 'Project Architecture Review',
        content: 'Review MongoDB indexes, aggregation pipelines, and JWT authentication flows.',
        owner: standardUser1._id,
      },
      {
        title: 'Grocery Checklist',
        content: 'Milk, eggs, coffee beans, and fresh fruits.',
        owner: standardUser1._id,
      },
      {
        title: 'Interview Preparation Notes',
        content: 'Deep dive into ESR rule and aggregation pipeline performance optimization.',
        owner: standardUser2._id,
      },
      {
        title: 'Admin Master Blueprint',
        content: 'System administration notes and operational roadmap.',
        owner: adminUser._id,
      },
    ]);

    console.log('Creating sample posts...');
    await Post.create([
      {
        title: 'Exploring MongoDB Aggregation Pipelines',
        content: 'Using $unwind, $group, and $lookup makes complex data transformations seamless and fast!',
        author: standardUser1._id,
      },
      {
        title: 'Tips for Efficient Database Indexing',
        content: 'Always apply the Equality, Sort, Range rule for compound indexes to minimize memory usage.',
        author: standardUser1._id,
      },
      {
        title: 'Best Practices in Role-Based Access Control',
        content: 'Keep authentication stateless with JWT and decouple authorization middlewares cleanly.',
        author: standardUser2._id,
      },
      {
        title: 'Welcome to the Platform',
        content: 'This platform demonstrates secure REST APIs, role-based access control, and index optimization.',
        author: adminUser._id,
      },
    ]);

    console.log('Database seeded successfully!');
    console.log('Sample Accounts:');
    console.log('  Admin User: admin@example.com / password123 (Role: admin)');
    console.log('  Standard User 1: alice@example.com / password123 (Role: user)');
    console.log('  Standard User 2: bob@example.com / password123 (Role: user)');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
