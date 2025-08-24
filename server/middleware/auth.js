const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Verify admin still exists and is active
    const [admins] = await pool.execute(
      'SELECT id, username, email, role, is_active FROM admins WHERE id = ? AND is_active = TRUE',
      [decoded.adminId]
    );

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.admin = admins[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to check if admin has super admin privileges
const requireSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin privileges required' });
  }
  next();
};

// Middleware to check if admin has admin or super admin privileges
const requireAdmin = (req, res, next) => {
  if (req.admin.role !== 'admin' && req.admin.role !== 'super_admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

// Rate limiting for login attempts
const loginLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authenticateToken,
  requireSuperAdmin,
  requireAdmin,
  loginLimiter
};
