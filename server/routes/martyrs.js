const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import modules
const { pool } = require('../config/database');
const { upload, handleUploadError } = require('../middleware/upload');
const { martyrValidation, handleValidationErrors } = require('../middleware/validation');
const { catchAsync, handleDatabaseError, handleFileError } = require('../utils/errorHandler');

// GET /api/martyrs - Get all martyrs with pagination and search
router.get('/', catchAsync(async (req, res) => {
  // Simple mock response for testing without database
  if (process.env.NODE_ENV === 'development' && req.query.mock === 'true') {
    return res.json({
      martyrs: [
        {
          id: 1,
          name_ar: "أحمد محمد",
          name_en: "Ahmed Mohamed",
          date_of_martyrdom: "2024-01-15",
          place_of_martyrdom: "غزة",
          education_level: "university",
          occupation: "طالب",
          bio: "شهيد من غزة"
        },
        {
          id: 2,
          name_ar: "فاطمة علي",
          name_en: "Fatima Ali",
          date_of_martyrdom: "2024-01-20",
          place_of_martyrdom: "القدس",
          education_level: "secondary",
          occupation: "معلمة",
          bio: "شهيدة من القدس"
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 2,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const educationLevel = req.query.education_level || '';
  const dateFrom = req.query.date_from || '';
  const dateTo = req.query.date_to || '';
  
    const offset = (page - 1) * limit;

  // Build WHERE conditions
  const whereConditions = [];
  const params = [];

    if (search) {
    whereConditions.push('(name_ar LIKE ? OR name_en LIKE ? OR occupation LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  if (educationLevel) {
    whereConditions.push('education_level = ?');
    params.push(educationLevel);
  }
  
  if (dateFrom) {
    whereConditions.push('date_of_martyrdom >= ?');
    params.push(dateFrom);
  }
  
  if (dateTo) {
    whereConditions.push('date_of_martyrdom <= ?');
    params.push(dateTo);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM martyrs ${whereClause}`;
  const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    // Get martyrs with pagination
  const query = `
    SELECT id, name_ar, name_en, date_of_martyrdom, place_of_martyrdom, 
           education_level, university_name, faculty, department,
           school_state, school_locality, spouse, children, occupation, bio, image_url, 
           created_at
    FROM martyrs  
    ${whereClause}
    ORDER BY date_of_martyrdom DESC, name_ar ASC 
    LIMIT ? OFFSET ?
  `;
  
  const [martyrs] = await pool.execute(query, [...params, limit, offset]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

      res.json({
      martyrs,
      pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage,
      hasPrevPage
    }
  });
}));

// GET /api/martyrs/stats/summary - Get summary statistics
router.get('/stats/summary', catchAsync(async (req, res) => {
  const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM martyrs');
  const [educationResult] = await pool.execute(`
    SELECT education_level, COUNT(*) as count 
    FROM martyrs 
    GROUP BY education_level
  `);
  const [monthlyResult] = await pool.execute(`
    SELECT 
      DATE_FORMAT(date_of_martyrdom, '%Y-%m') as month,
      COUNT(*) as count
    FROM martyrs 
    WHERE date_of_martyrdom >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(date_of_martyrdom, '%Y-%m')
    ORDER BY month DESC
  `);
  
  res.json({
    total: totalResult[0].total,
    byEducation: educationResult,
    byMonth: monthlyResult
  });
}));

// GET /api/martyrs/:id - Get a specific martyr
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    
  const query = `
    SELECT id, name_ar, name_en, date_of_martyrdom, place_of_martyrdom, 
           education_level, university_name, faculty, department,
           school_state, school_locality, spouse, children, occupation, bio, image_url, 
           created_at
    FROM martyrs 
    WHERE id = ?
  `;
  
  const [martyrs] = await pool.execute(query, [id]);

    if (martyrs.length === 0) {
      return res.status(404).json({ error: 'Martyr not found' });
    }

  res.json({ martyr: martyrs[0] });
}));

// POST /api/martyrs/public - Add a new martyr (public endpoint)
router.post('/public', 
  upload.single('image'), 
  martyrValidation, 
  handleValidationErrors,
  handleUploadError,
  catchAsync(async (req, res) => {
    const {
      name_ar,
      name_en,
      date_of_martyrdom,
      place_of_martyrdom,
      education_level,
      university_name,
      faculty,
      department,
      school_state,
      school_locality,
      spouse,
      children,
      occupation,
      bio
    } = req.body;
    
    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    // Handle place_of_martyrdom as string (frontend sends formatted string)
    let parsedPlace = place_of_martyrdom;
    if (typeof place_of_martyrdom === 'object') {
      parsedPlace = JSON.stringify(place_of_martyrdom);
    }
    
    const query = `
      INSERT INTO martyrs (
        name_ar, name_en, date_of_martyrdom, place_of_martyrdom,
        education_level, university_name, faculty, department,
        school_state, school_locality, spouse, children, occupation, bio, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      name_ar,
      name_en,
      date_of_martyrdom,
      parsedPlace,
      education_level,
      university_name || null,
      faculty || null,
      department || null,
      school_state || null,
      school_locality || null,
      spouse || null,
      children || null,
      occupation,
      bio || null,
      image_url
    ]);
    
    // Get the inserted martyr
    const [newMartyr] = await pool.execute(
      'SELECT * FROM martyrs WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({ 
      message: 'Martyr added successfully',
      martyr: newMartyr[0]
    });
}));

// POST /api/martyrs - Add a new martyr (admin endpoint)
router.post('/', 
  upload.single('image'), 
  martyrValidation, 
  handleValidationErrors,
  handleUploadError,
  catchAsync(async (req, res) => {
    const {
      name_ar,
      name_en,
      date_of_martyrdom,
      place_of_martyrdom,
      education_level,
      university_name,
      faculty,
      department,
      school_state,
      school_locality,
      spouse,
      children,
      occupation,
      bio
    } = req.body;

    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }
    
    // Handle place_of_martyrdom as string (frontend sends formatted string)
    let parsedPlace = place_of_martyrdom;
    if (typeof place_of_martyrdom === 'object') {
      parsedPlace = JSON.stringify(place_of_martyrdom);
    }
    
    const query = `
      INSERT INTO martyrs (
        name_ar, name_en, date_of_martyrdom, place_of_martyrdom,
        education_level, university_name, faculty, department,
        school_state, school_locality, spouse, children, occupation, bio, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      name_ar,
      name_en,
      date_of_martyrdom,
      parsedPlace,
      education_level,
      university_name || null,
      faculty || null,
      department || null,
      school_state || null,
      school_locality || null,
      spouse || null,
      children || null,
      occupation,
      bio || null,
      image_url
    ]);
    
    // Get the inserted martyr
    const [newMartyr] = await pool.execute(
      'SELECT * FROM martyrs WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ 
      message: 'Martyr added successfully',
      martyr: newMartyr[0]
    });
}));

// PUT /api/martyrs/:id - Update a martyr
router.put('/:id', 
  upload.single('image'), 
  martyrValidation, 
  handleValidationErrors,
  handleUploadError,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    
    // Check if martyr exists
    const [existing] = await pool.execute('SELECT * FROM martyrs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Martyr not found' });
    }

    const {
      name_ar,
      name_en,
      date_of_martyrdom,
      place_of_martyrdom,
      education_level,
      university_name,
      faculty,
      department,
      school_state,
      school_locality,
      spouse,
      children,
      occupation,
      bio
    } = req.body;
    
    // Handle image upload
    let image_url = existing[0].image_url;
    if (req.file) {
      // Delete old image if exists
      if (existing[0].image_url) {
        const oldImagePath = path.join(__dirname, '../..', existing[0].image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image_url = `/uploads/${req.file.filename}`;
    }
    
    // Handle place_of_martyrdom as string
    let parsedPlace = place_of_martyrdom;
    if (typeof place_of_martyrdom === 'object') {
      parsedPlace = JSON.stringify(place_of_martyrdom);
    }
    
    const query = `
      UPDATE martyrs SET 
        name_ar = ?, name_en = ?, date_of_martyrdom = ?, place_of_martyrdom = ?,
        education_level = ?, university_name = ?, faculty = ?, department = ?,
        school_state = ?, school_locality = ?, spouse = ?, children = ?, 
        occupation = ?, bio = ?, image_url = ?
      WHERE id = ?
    `;
    
    await pool.execute(query, [
      name_ar,
      name_en,
      date_of_martyrdom,
      parsedPlace,
      education_level,
      university_name || null,
      faculty || null,
      department || null,
      school_state || null,
      school_locality || null,
      spouse || null,
      children || null,
      occupation,
      bio || null,
      image_url,
      id
    ]);
    
    // Get the updated martyr
    const [updatedMartyr] = await pool.execute(
      'SELECT * FROM martyrs WHERE id = ?',
      [id]
    );

    res.json({ 
      message: 'Martyr updated successfully',
      martyr: updatedMartyr[0]
    });
}));

// DELETE /api/martyrs/:id - Delete a martyr
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    
  // Check if martyr exists
  const [existing] = await pool.execute('SELECT * FROM martyrs WHERE id = ?', [id]);
  if (existing.length === 0) {
      return res.status(404).json({ error: 'Martyr not found' });
    }
  
  // Delete image file if exists
  if (existing[0].image_url) {
    const imagePath = path.join(__dirname, '../..', existing[0].image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  
  // Delete from database
  await pool.execute('DELETE FROM martyrs WHERE id = ?', [id]);

    res.json({ message: 'Martyr deleted successfully' });
}));

module.exports = router;

