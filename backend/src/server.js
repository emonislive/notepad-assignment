require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

const stopServer = async () => {
  if (server) {
    server.close();
  }
  await disconnectDB();
};

// Graceful termination handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await stopServer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await stopServer();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, stopServer };
