const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import modules
const { pool } = require('../config/database');
const { upload, handleUploadError } = require('../middleware/upload');
const { martyrValidation, handleValidationErrors } = require('../middleware/validation');
const { catchAsync, handleDatabaseError, handleFileError } = require('../utils/errorHandler');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/martyrs - Get all approved martyrs (public)
router.get('/', catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const place = req.query.place || '';
  const education = req.query.education || '';
  
  const offset = (page - 1) * limit;
  
  // Use status field for filtering
  const whereConditions = ['status = "approved"']; // Only show approved martyrs
  const params = [];

  if (search) {
    whereConditions.push('(name_ar LIKE ? OR name_en LIKE ? OR bio LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (place) {
    whereConditions.push('place_of_martyrdom LIKE ?');
    params.push(`%${place}%`);
  }

  if (education) {
    whereConditions.push('education_level = ?');
    params.push(education);
  }

  const whereClause = whereConditions.join(' AND ');

  // Get total count
  const [countResult] = await pool.execute(
    `SELECT COUNT(*) as total FROM martyrs WHERE ${whereClause}`,
    params
  );
  const totalItems = countResult[0].total;

  // Get martyrs with pagination
  const [martyrs] = await pool.execute(
    `SELECT * FROM martyrs WHERE ${whereClause} ORDER BY date_of_martyrdom DESC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );

  const totalPages = Math.ceil(totalItems / limit);

  res.json({
    martyrs,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: parseInt(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
}));

// GET /api/martyrs/stats/summary - Get summary statistics
router.get('/stats/summary', catchAsync(async (req, res) => {
  const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM martyrs WHERE status = "approved"');
  const [educationResult] = await pool.execute(`
    SELECT education_level, COUNT(*) as count 
    FROM martyrs 
    WHERE status = "approved"
    GROUP BY education_level
  `);
  const [monthlyResult] = await pool.execute(`
    SELECT 
      DATE_FORMAT(date_of_martyrdom, '%Y-%m') as month,
      COUNT(*) as count
    FROM martyrs 
    WHERE status = "approved" AND date_of_martyrdom >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
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
    WHERE id = ? AND status = "approved"
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
        school_state, school_locality, spouse, children, occupation, bio, image_url, 
        status, approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', FALSE)
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
  authenticateToken,
  requireAdmin,
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
        school_state, school_locality, spouse, children, occupation, bio, image_url, 
        status, approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', TRUE)
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
  authenticateToken,
  requireAdmin,
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
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  catchAsync(async (req, res) => {
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

// GET /api/martyrs/admin/all - Get all martyrs for admin (with additional fields)
router.get('/admin/all', 
  authenticateToken,
  requireAdmin,
  catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  const educationLevel = req.query.education_level || '';
  const dateFrom = req.query.date_from || '';
  const dateTo = req.query.date_to || '';
  const approvalStatus = req.query.approval_status || '';
  
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

  if (approvalStatus) {
    whereConditions.push('status = ?');
    params.push(approvalStatus);
  }

  const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM martyrs ${whereClause}`;
  const [countResult] = await pool.execute(countQuery, params);
  const total = countResult[0].total;

  // Get martyrs with pagination (admin view includes all fields)
  const selectFields = `id, name_ar, name_en, date_of_martyrdom, place_of_martyrdom, 
       education_level, university_name, faculty, department,
       school_state, school_locality, spouse, children, occupation, bio, image_url, 
       approved, status, created_at, updated_at`;

  const query = `
    SELECT ${selectFields}
    FROM martyrs  
    ${whereClause}
    ORDER BY created_at DESC, name_ar ASC 
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

// PATCH /api/martyrs/:id/approve - Update martyr status
router.patch('/:id/approve', 
  authenticateToken,
  requireAdmin,
  catchAsync(async (req, res) => {
  const { id } = req.params;
  const { approved, status } = req.body;
  
  console.log('Approval request received:', { id, approved, status, body: req.body });
  
  // Check if martyr exists
  const [existing] = await pool.execute('SELECT * FROM martyrs WHERE id = ?', [id]);
  if (existing.length === 0) {
    console.log('Martyr not found:', id);
    return res.status(404).json({ error: 'Martyr not found' });
  }
  
  console.log('Existing martyr:', existing[0]);
  
  // Determine the new status
  let newStatus = 'pending';
  let newApproved = false;
  
  if (status) {
    // If status is provided directly, use it
    newStatus = status;
    newApproved = (status === 'approved');
  } else if (approved !== undefined) {
    // If approved boolean is provided, convert to status
    newStatus = approved ? 'approved' : 'pending';
    newApproved = approved;
  }
  
  console.log('New status values:', { newStatus, newApproved });
  
  // Update both status and approved field for consistency
  await pool.execute(
    'UPDATE martyrs SET status = ?, approved = ? WHERE id = ?', 
    [newStatus, newApproved ? 1 : 0, id]
  );
  
  // Get the updated martyr
  const [updatedMartyr] = await pool.execute(
    'SELECT * FROM martyrs WHERE id = ?',
    [id]
  );

  console.log('Updated martyr:', updatedMartyr[0]);

  const statusMessages = {
    'approved': 'Martyr approved successfully',
    'rejected': 'Martyr rejected successfully',
    'pending': 'Martyr status set to pending'
  };

  res.json({ 
    message: statusMessages[newStatus] || 'Martyr status updated successfully',
    martyr: updatedMartyr[0]
  });
}));

// GET /api/martyrs/admin/:id - Get a specific martyr for admin (including unapproved)
router.get('/admin/:id', 
  authenticateToken,
  requireAdmin,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const query = `
      SELECT id, name_ar, name_en, date_of_martyrdom, place_of_martyrdom, 
             education_level, university_name, faculty, department,
             school_state, school_locality, spouse, children, occupation, bio, image_url, 
             approved, status, created_at, updated_at
      FROM martyrs 
      WHERE id = ?
    `;
    
    const [martyrs] = await pool.execute(query, [id]);

    if (martyrs.length === 0) {
      return res.status(404).json({ error: 'Martyr not found' });
    }

    res.json({ martyr: martyrs[0] });
}));

module.exports = router;

