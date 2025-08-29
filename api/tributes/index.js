const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'martyrs_archive',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Helper function to authenticate admin token
function authenticateToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('Access token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Helper function to validate tribute data
function validateTributeData(data) {
  const errors = [];
  
  if (!data.martyr_id) {
    errors.push('Martyr ID is required');
  }
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message is required and must be at least 10 characters');
  }
  
  if (data.message && data.message.trim().length > 1000) {
    errors.push('Message must be less than 1000 characters');
  }
  
  return errors;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const connection = await pool.getConnection();

    try {
      // GET request - Get tributes
      if (req.method === 'GET') {
        const { 
          page = 1, 
          limit = 10, 
          martyr_id = '',
          approved = 'true' // Only show approved tributes by default
        } = req.query;

        const offset = (page - 1) * limit;
        const whereConditions = ['approved = ?'];
        const params = [approved === 'true' ? 1 : 0];

        if (martyr_id) {
          whereConditions.push('martyr_id = ?');
          params.push(martyr_id);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const [countResult] = await connection.execute(
          `SELECT COUNT(*) as total FROM tributes WHERE ${whereClause}`,
          params
        );
        const totalItems = countResult[0].total;

        // Get tributes with pagination
        const [tributes] = await connection.execute(
          `SELECT t.*, m.name_ar as martyr_name_ar, m.name_en as martyr_name_en 
           FROM tributes t 
           LEFT JOIN martyrs m ON t.martyr_id = m.id 
           WHERE ${whereClause} 
           ORDER BY t.created_at DESC 
           LIMIT ? OFFSET ?`,
          [...params, parseInt(limit), offset]
        );

        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
          tributes,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        });
      }

      // POST request - Add new tribute
      else if (req.method === 'POST') {
        const tributeData = req.body;

        // Validate data
        const validationErrors = validateTributeData(tributeData);
        if (validationErrors.length > 0) {
          return res.status(400).json({ errors: validationErrors });
        }

        // Check if martyr exists and is approved
        const [martyrs] = await connection.execute(
          'SELECT id FROM martyrs WHERE id = ? AND approved = 1',
          [tributeData.martyr_id]
        );

        if (martyrs.length === 0) {
          return res.status(404).json({ error: 'Martyr not found or not approved' });
        }

        // Insert tribute into database
        const [result] = await connection.execute(
          `INSERT INTO tributes (
            martyr_id, name, message, approved, created_at
          ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            tributeData.martyr_id,
            tributeData.name.trim(),
            tributeData.message.trim(),
            0 // Default to not approved
          ]
        );

        const [newTribute] = await connection.execute(
          'SELECT * FROM tributes WHERE id = ?',
          [result.insertId]
        );

        res.status(201).json({
          message: 'Tribute submitted successfully and awaiting approval',
          tribute: newTribute[0]
        });
      }

      else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Tributes API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
