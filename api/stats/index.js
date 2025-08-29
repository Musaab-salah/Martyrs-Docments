const mysql = require('mysql2/promise');

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
    const connection = await pool.getConnection();

    try {
      // Get basic statistics
      const [totalMartyrs] = await connection.execute(
        'SELECT COUNT(*) as total FROM martyrs WHERE approved = 1'
      );

      const [pendingMartyrs] = await connection.execute(
        'SELECT COUNT(*) as total FROM martyrs WHERE approved = 0'
      );

      const [recentMartyrs] = await connection.execute(
        'SELECT COUNT(*) as total FROM martyrs WHERE approved = 1 AND date_of_martyrdom >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)'
      );

      // Get statistics by place
      const [placeStats] = await connection.execute(
        `SELECT place_of_martyrdom, COUNT(*) as count 
         FROM martyrs 
         WHERE approved = 1 
         GROUP BY place_of_martyrdom 
         ORDER BY count DESC 
         LIMIT 10`
      );

      // Get statistics by education level
      const [educationStats] = await connection.execute(
        `SELECT education_level, COUNT(*) as count 
         FROM martyrs 
         WHERE approved = 1 AND education_level IS NOT NULL 
         GROUP BY education_level 
         ORDER BY count DESC`
      );

      // Get statistics by age group
      const [ageStats] = await connection.execute(
        `SELECT 
           CASE 
             WHEN age < 18 THEN 'Under 18'
             WHEN age BETWEEN 18 AND 25 THEN '18-25'
             WHEN age BETWEEN 26 AND 35 THEN '26-35'
             WHEN age BETWEEN 36 AND 50 THEN '36-50'
             WHEN age > 50 THEN 'Over 50'
             ELSE 'Unknown'
           END as age_group,
           COUNT(*) as count
         FROM martyrs 
         WHERE approved = 1 
         GROUP BY age_group 
         ORDER BY count DESC`
      );

      // Get monthly statistics for the current year
      const [monthlyStats] = await connection.execute(
        `SELECT 
           MONTH(date_of_martyrdom) as month,
           COUNT(*) as count
         FROM martyrs 
         WHERE approved = 1 
           AND YEAR(date_of_martyrdom) = YEAR(CURDATE())
         GROUP BY MONTH(date_of_martyrdom)
         ORDER BY month`
      );

      // Get total tributes
      const [totalTributes] = await connection.execute(
        'SELECT COUNT(*) as total FROM tributes WHERE approved = 1'
      );

      // Get pending tributes
      const [pendingTributes] = await connection.execute(
        'SELECT COUNT(*) as total FROM tributes WHERE approved = 0'
      );

      const stats = {
        summary: {
          totalMartyrs: totalMartyrs[0].total,
          pendingMartyrs: pendingMartyrs[0].total,
          recentMartyrs: recentMartyrs[0].total,
          totalTributes: totalTributes[0].total,
          pendingTributes: pendingTributes[0].total
        },
        byPlace: placeStats,
        byEducation: educationStats,
        byAge: ageStats,
        monthly: monthlyStats,
        timestamp: new Date().toISOString()
      };

      res.status(200).json(stats);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
