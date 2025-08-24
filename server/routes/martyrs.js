const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/photos'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'martyr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all martyrs with pagination and search
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('city').optional().isString().trim(),
  query('year').optional().isInt({ min: 1900, max: new Date().getFullYear() }),
  query('ageGroup').optional().isIn(['0-18', '19-30', '31-50', '51+']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search;
    const city = req.query.city;
    const year = req.query.year;
    const ageGroup = req.query.ageGroup;

    let whereConditions = [];
    let queryParams = [];

    // Build search conditions
    if (search) {
      whereConditions.push('(full_name LIKE ? OR biography LIKE ? OR place_of_martyrdom LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (city) {
      whereConditions.push('place_of_martyrdom LIKE ?');
      queryParams.push(`%${city}%`);
    }

    if (year) {
      whereConditions.push('YEAR(date_of_martyrdom) = ?');
      queryParams.push(year);
    }

    if (ageGroup) {
      const [minAge, maxAge] = ageGroup.split('-').map(Number);
      if (ageGroup === '51+') {
        whereConditions.push('age >= ?');
        queryParams.push(51);
      } else {
        whereConditions.push('age BETWEEN ? AND ?');
        queryParams.push(minAge, maxAge);
      }
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM martyrs ${whereClause}`,
      queryParams
    );
    const total = countResult[0].total;

    // Get martyrs with pagination
    const [martyrs] = await pool.execute(
      `SELECT id, full_name, photo_url, place_of_martyrdom, date_of_martyrdom, age, 
              biography, education, occupation, role, created_at 
       FROM martyrs ${whereClause} 
       ORDER BY date_of_martyrdom DESC, full_name ASC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    res.json({
      martyrs,
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
    console.error('Error fetching martyrs:', error);
    res.status(500).json({ error: 'Failed to fetch martyrs' });
  }
});

// Get single martyr by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [martyrs] = await pool.execute(
      'SELECT * FROM martyrs WHERE id = ?',
      [id]
    );

    if (martyrs.length === 0) {
      return res.status(404).json({ error: 'Martyr not found' });
    }

    // Get tributes for this martyr
    const [tributes] = await pool.execute(
      'SELECT id, visitor_name, message, created_at FROM tributes WHERE martyr_id = ? AND is_approved = TRUE ORDER BY created_at DESC',
      [id]
    );

    const martyr = martyrs[0];
    martyr.tributes = tributes;

    res.json(martyr);
  } catch (error) {
    console.error('Error fetching martyr:', error);
    res.status(500).json({ error: 'Failed to fetch martyr' });
  }
});

// Create new martyr (Admin only)
router.post('/', [
  authenticateToken,
  requireAdmin,
  upload.single('photo'),
  body('full_name').trim().isLength({ min: 2, max: 255 }).withMessage('Full name must be between 2 and 255 characters'),
  body('place_of_martyrdom').trim().isLength({ min: 2, max: 255 }).withMessage('Place of martyrdom must be between 2 and 255 characters'),
  body('date_of_martyrdom').isISO8601().withMessage('Invalid date format'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('biography').optional().isLength({ max: 5000 }).withMessage('Biography must not exceed 5000 characters'),
  body('education').optional().isLength({ max: 500 }).withMessage('Education must not exceed 500 characters'),
  body('occupation').optional().isLength({ max: 255 }).withMessage('Occupation must not exceed 255 characters'),
  body('role').optional().isLength({ max: 255 }).withMessage('Role must not exceed 255 characters'),
  body('personal_story').optional().isLength({ max: 10000 }).withMessage('Personal story must not exceed 10000 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let photoUrl = null;
    if (req.file) {
      // Process and optimize image
      const optimizedFilename = 'optimized-' + req.file.filename;
      await sharp(req.file.path)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(path.join(path.dirname(req.file.path), optimizedFilename));
      
      photoUrl = `/uploads/photos/${optimizedFilename}`;
    }

    const {
      full_name,
      place_of_martyrdom,
      date_of_martyrdom,
      age,
      biography,
      education,
      occupation,
      role,
      personal_story,
      coordinates
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO martyrs (full_name, photo_url, place_of_martyrdom, date_of_martyrdom, 
                           age, biography, education, occupation, role, personal_story, coordinates) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, photoUrl, place_of_martyrdom, date_of_martyrdom, age, biography, 
       education, occupation, role, personal_story, coordinates ? JSON.stringify(coordinates) : null]
    );

    const [newMartyr] = await pool.execute(
      'SELECT * FROM martyrs WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newMartyr[0]);
  } catch (error) {
    console.error('Error creating martyr:', error);
    res.status(500).json({ error: 'Failed to create martyr' });
  }
});

// Update martyr (Admin only)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  upload.single('photo'),
  body('full_name').optional().trim().isLength({ min: 2, max: 255 }),
  body('place_of_martyrdom').optional().trim().isLength({ min: 2, max: 255 }),
  body('date_of_martyrdom').optional().isISO8601(),
  body('age').optional().isInt({ min: 0, max: 150 }),
  body('biography').optional().isLength({ max: 5000 }),
  body('education').optional().isLength({ max: 500 }),
  body('occupation').optional().isLength({ max: 255 }),
  body('role').optional().isLength({ max: 255 }),
  body('personal_story').optional().isLength({ max: 10000 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    
    // Check if martyr exists
    const [existing] = await pool.execute(
      'SELECT * FROM martyrs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Martyr not found' });
    }

    let photoUrl = existing[0].photo_url;
    if (req.file) {
      // Process and optimize new image
      const optimizedFilename = 'optimized-' + req.file.filename;
      await sharp(req.file.path)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(path.join(path.dirname(req.file.path), optimizedFilename));
      
      photoUrl = `/uploads/photos/${optimizedFilename}`;
    }

    const updateFields = [];
    const updateValues = [];

    // Build dynamic update query
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && req.body[key] !== '') {
        updateFields.push(`${key} = ?`);
        updateValues.push(req.body[key]);
      }
    });

    if (photoUrl !== existing[0].photo_url) {
      updateFields.push('photo_url = ?');
      updateValues.push(photoUrl);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE martyrs SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const [updatedMartyr] = await pool.execute(
      'SELECT * FROM martyrs WHERE id = ?',
      [id]
    );

    res.json(updatedMartyr[0]);
  } catch (error) {
    console.error('Error updating martyr:', error);
    res.status(500).json({ error: 'Failed to update martyr' });
  }
});

// Delete martyr (Admin only)
router.delete('/:id', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM martyrs WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Martyr not found' });
    }

    res.json({ message: 'Martyr deleted successfully' });
  } catch (error) {
    console.error('Error deleting martyr:', error);
    res.status(500).json({ error: 'Failed to delete martyr' });
  }
});

module.exports = router;
