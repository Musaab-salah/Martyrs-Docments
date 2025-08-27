const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Submit a tribute (Public)
router.post('/', [
  body('martyr_id').isInt({ min: 1 }).withMessage('Valid martyr ID is required'),
  body('visitor_name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { martyr_id, visitor_name, message } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;

    // Verify martyr exists
    const [martyrs] = await pool.execute(
      'SELECT id FROM martyrs WHERE id = ?',
      [martyr_id]
    );

    if (martyrs.length === 0) {
      return res.status(404).json({ error: 'Martyr not found' });
    }

    // Check for spam (same IP, same martyr, within 24 hours)
    const [recentTributes] = await pool.execute(
      'SELECT id FROM tributes WHERE martyr_id = ? AND ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)',
      [martyr_id, ip_address]
    );

    if (recentTributes.length > 0) {
      return res.status(429).json({ error: 'You can only submit one tribute per martyr per day' });
    }

    // Insert tribute
    const [result] = await pool.execute(
      'INSERT INTO tributes (martyr_id, visitor_name, message, ip_address) VALUES (?, ?, ?, ?)',
      [martyr_id, visitor_name, message, ip_address]
    );

    res.status(201).json({
      message: 'Tribute submitted successfully. It will be reviewed by an administrator before being published.',
      tribute_id: result.insertId
    });
  } catch (error) {
    console.error('Tribute submission error:', error);
    res.status(500).json({ error: 'Failed to submit tribute' });
  }
});

// Get tributes for a specific martyr (Public - only approved)
router.get('/martyr/:martyrId', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { martyrId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Verify martyr exists
    const [martyrs] = await pool.execute(
      'SELECT id, name_ar, name_en FROM martyrs WHERE id = ?',
      [martyrId]
    );

    if (martyrs.length === 0) {
      return res.status(404).json({ error: 'Martyr not found' });
    }

    // Get total count of approved tributes
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM tributes WHERE martyr_id = ? AND is_approved = TRUE',
      [martyrId]
    );
    const total = countResult[0].total;

    // Get approved tributes with pagination
    const [tributes] = await pool.execute(
      `SELECT id, visitor_name, message, created_at 
       FROM tributes 
       WHERE martyr_id = ? AND is_approved = TRUE 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [martyrId, limit, offset]
    );

    res.json({
      martyr: martyrs[0],
      tributes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Fetch tributes error:', error);
    res.status(500).json({ error: 'Failed to fetch tributes' });
  }
});

// Get all pending tributes (Admin only)
router.get('/pending', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get total count of pending tributes
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM tributes WHERE is_approved = FALSE'
    );
    const total = countResult[0].total;

    // Get pending tributes with martyr information
    const [tributes] = await pool.execute(
      `SELECT t.id, t.visitor_name, t.message, t.ip_address, t.created_at,
              m.id as martyr_id, m.name_ar as martyr_name, m.place_of_martyrdom
       FROM tributes t
       JOIN martyrs m ON t.martyr_id = m.id
       WHERE t.is_approved = FALSE
       ORDER BY t.created_at ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      tributes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Fetch pending tributes error:', error);
    res.status(500).json({ error: 'Failed to fetch pending tributes' });
  }
});

// Approve tribute (Admin only)
router.patch('/:id/approve', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'UPDATE tributes SET is_approved = TRUE WHERE id = ? AND is_approved = FALSE',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tribute not found or already approved' });
    }

    res.json({ message: 'Tribute approved successfully' });
  } catch (error) {
    console.error('Approve tribute error:', error);
    res.status(500).json({ error: 'Failed to approve tribute' });
  }
});

// Reject tribute (Admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM tributes WHERE id = ? AND is_approved = FALSE',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tribute not found or already approved' });
    }

    res.json({ message: 'Tribute rejected and deleted successfully' });
  } catch (error) {
    console.error('Reject tribute error:', error);
    res.status(500).json({ error: 'Failed to reject tribute' });
  }
});

// Bulk approve tributes (Admin only)
router.post('/bulk-approve', [
  authenticateToken,
  requireAdmin,
  body('tributeIds').isArray({ min: 1 }).withMessage('At least one tribute ID is required'),
  body('tributeIds.*').isInt({ min: 1 }).withMessage('All tribute IDs must be valid integers'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tributeIds } = req.body;

    const [result] = await pool.execute(
      'UPDATE tributes SET is_approved = TRUE WHERE id IN (?) AND is_approved = FALSE',
      [tributeIds]
    );

    res.json({
      message: `${result.affectedRows} tributes approved successfully`,
      approvedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({ error: 'Failed to approve tributes' });
  }
});

// Get tribute statistics (Admin only)
router.get('/stats', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // Total tributes
    const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM tributes');
    
    // Pending tributes
    const [pendingResult] = await pool.execute('SELECT COUNT(*) as pending FROM tributes WHERE is_approved = FALSE');
    
    // Approved tributes
    const [approvedResult] = await pool.execute('SELECT COUNT(*) as approved FROM tributes WHERE is_approved = TRUE');
    
    // Tributes by month (last 12 months)
    const [monthlyResult] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM tributes 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    // Top martyrs by tribute count
    const [topMartyrsResult] = await pool.execute(`
      SELECT 
        m.id,
                      m.name_ar,
        m.place_of_martyrdom,
        COUNT(t.id) as tribute_count
      FROM martyrs m
      LEFT JOIN tributes t ON m.id = t.martyr_id AND t.is_approved = TRUE
      GROUP BY m.id
      HAVING tribute_count > 0
      ORDER BY tribute_count DESC
      LIMIT 10
    `);

    res.json({
      total: totalResult[0].total,
      pending: pendingResult[0].pending,
      approved: approvedResult[0].approved,
      monthly: monthlyResult,
      topMartyrs: topMartyrsResult
    });
  } catch (error) {
    console.error('Tribute stats error:', error);
    res.status(500).json({ error: 'Failed to fetch tribute statistics' });
  }
});

module.exports = router;
