const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure_notes';

  try {
    await mongoose.connect(uri);
    console.log(`Connected to MongoDB at ${uri}`);
  } catch (err) {
    console.error(`Failed to connect to MongoDB at ${uri}:`, err.message);
    throw err;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('Error disconnecting from MongoDB:', err.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
