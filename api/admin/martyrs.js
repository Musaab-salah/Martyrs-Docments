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

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate admin
    try {
      authenticateToken(req);
    } catch (authError) {
      return res.status(401).json({ error: authError.message });
    }

    const connection = await pool.getConnection();

    try {
      const { 
        page = 1, 
        limit = 10, 
        search = '', 
        place = '', 
        education = '',
        approved = '' // Show all by default for admin
      } = req.query;

      const offset = (page - 1) * limit;
      const whereConditions = [];
      const params = [];

      // Handle approved filter
      if (approved !== '') {
        whereConditions.push('approved = ?');
        params.push(approved === 'true' ? 1 : 0);
      }

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

      const whereClause = whereConditions.length > 0 ? whereConditions.join(' AND ') : '1=1';

      // Get total count
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM martyrs WHERE ${whereClause}`,
        params
      );
      const totalItems = countResult[0].total;

      // Get martyrs with pagination
      const [martyrs] = await connection.execute(
        `SELECT * FROM martyrs WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      );

      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
        martyrs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Admin martyrs API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
