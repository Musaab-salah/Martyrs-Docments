const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, loginLimiter } = require('../middleware/auth');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

// Admin login (original path for backward compatibility)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple mock authentication for development mode
    if (username === 'sudansust' && password === 'sust@1989') {
      const token = jwt.sign(
        { 
          adminId: 1, 
          username: 'sudansust', 
          role: 'super_admin' 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login successful (Development Mode)',
        token,
        admin: {
          id: 1,
          username: 'sudansust',
          email: 'sudansust@martyrsarchive.com',
          role: 'super_admin'
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Database authentication (when available)
    if (pool) {
      // Find admin by username or email
      const [admins] = await pool.execute(
        'SELECT * FROM admins WHERE (username = ? OR email = ?) AND is_active = TRUE',
        [username, username]
      );

      if (admins.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const admin = admins[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await pool.execute(
        'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [admin.id]
      );

      // Generate JWT token
      const token = jwt.sign(
        { 
          adminId: admin.id, 
          username: admin.username, 
          role: admin.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin login (new path)
router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Simple mock authentication for development mode
    if (username === 'sudansust' && password === 'sust@1989') {
      const token = jwt.sign(
        { 
          adminId: 1, 
          username: 'sudansust', 
          role: 'super_admin' 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.json({
        message: 'Login successful (Development Mode)',
        token,
        admin: {
          id: 1,
          username: 'sudansust',
          email: 'sudansust@martyrsarchive.com',
          role: 'super_admin'
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Find admin by username or email
    const [admins] = await pool.execute(
      'SELECT * FROM admins WHERE (username = ? OR email = ?) AND is_active = TRUE',
      [username, username]
    );

    if (admins.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = admins[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.execute(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [admin.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username, 
        role: admin.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register new admin (Super admin only)
router.post('/register', [
  authenticateToken,
  body('username').trim().isLength({ min: 3, max: 100 }).withMessage('Username must be between 3 and 100 characters'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'super_admin']).withMessage('Invalid role'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if current user is super admin
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin privileges required' });
    }

    const { username, email, password, role = 'admin' } = req.body;

    // Check if username or email already exists
    const [existing] = await pool.execute(
      'SELECT id FROM admins WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const [result] = await pool.execute(
      'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, role]
    );

    const [newAdmin] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM admins WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Admin created successfully',
      admin: newAdmin[0]
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get current admin profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [admins] = await pool.execute(
      'SELECT id, username, email, role, last_login, created_at FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json(admins[0]);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update admin profile
router.put('/profile', [
  authenticateToken,
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('currentPassword').optional().isLength({ min: 6 }).withMessage('Current password must be at least 6 characters'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, currentPassword, newPassword } = req.body;

    // Get current admin data
    const [admins] = await pool.execute(
      'SELECT * FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = admins[0];
    const updateFields = [];
    const updateValues = [];

    // Update email if provided
    if (email && email !== admin.email) {
      // Check if email is already taken
      const [existing] = await pool.execute(
        'SELECT id FROM admins WHERE email = ? AND id != ?',
        [email, admin.id]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      updateFields.push('email = ?');
      updateValues.push(email);
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      updateFields.push('password_hash = ?');
      updateValues.push(newPasswordHash);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(admin.id);

    await pool.execute(
      `UPDATE admins SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get all admins (Super admin only)
router.get('/admins', [authenticateToken], async (req, res) => {
  try {
    // Only super admins can see all admins
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin privileges required' });
    }

    const [admins] = await pool.execute(
      'SELECT id, username, email, role, is_active, last_login, created_at FROM admins ORDER BY created_at DESC'
    );

    res.json(admins);
  } catch (error) {
    console.error('Fetch admins error:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Toggle admin status (Super admin only)
router.patch('/admins/:id/toggle', [authenticateToken], async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin privileges required' });
    }

    const { id } = req.params;

    // Prevent deactivating self
    if (parseInt(id) === req.admin.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const [result] = await pool.execute(
      'UPDATE admins SET is_active = NOT is_active WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Admin status updated successfully' });
  } catch (error) {
    console.error('Toggle admin error:', error);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    admin: {
      id: req.admin.id,
      username: req.admin.username,
      role: req.admin.role
    }
  });
});

module.exports = router;
