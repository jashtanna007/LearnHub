const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header.
 * Attaches decoded payload (id, email, role) to req.user.
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
    return res.status(500).json({ error: 'Authentication failed.' });
  }
};

/**
 * Middleware factory to authorize specific roles.
 * Usage: authorizeRoles('student', 'instructor')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. You do not have permission to access this resource.' 
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRoles };
