const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secure-notes-secret-key-12345';

/**
 * Middleware to authenticate requests using JWT tokens.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Missing or malformed Bearer token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User associated with token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }
    next(err);
  }
};

/**
 * Role-Based Access Control (RBAC) middleware.
 * Verifies that the authenticated user possesses one of the allowed roles.
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your role is '${req.user.role}'.`,
      });
    }
    next();
  };
};

const requireAdmin = requireRole('admin');

module.exports = {
  authenticate,
  requireRole,
  requireAdmin,
  JWT_SECRET,
};
