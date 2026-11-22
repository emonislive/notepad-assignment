/**
 * Centralized Express error-handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  // Log error for server diagnostics
  if (process.env.NODE_ENV !== 'test') {
    console.error('Unhandled Error:', err);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      details: messages,
    });
  }

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Invalid ${err.path}: '${err.value}' is not a valid format.`,
    });
  }

  // Handle MongoDB duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      error: `Duplicate value: '${err.keyValue[field]}' is already in use for '${field}'.`,
    });
  }

  // Fallback to 500 Internal Server Error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
