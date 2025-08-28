const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get overall statistics (Public)
router.get('/overview', async (req, res) => {
  try {
    // Total martyrs
    const [totalMartyrs] = await pool.execute('SELECT COUNT(*) as total FROM martyrs');
    
    // Martyrs by year
    const [martyrsByYear] = await pool.execute(`
      SELECT 
        YEAR(date_of_martyrdom) as year,
        COUNT(*) as count
      FROM martyrs 
      GROUP BY YEAR(date_of_martyrdom)
      ORDER BY year DESC
    `);

    // Martyrs by city/region
    const [martyrsByCity] = await pool.execute(`
      SELECT 
        place_of_martyrdom,
        COUNT(*) as count
      FROM martyrs 
      GROUP BY place_of_martyrdom
      ORDER BY count DESC
      LIMIT 10
    `);

    // Age distribution
    const [ageDistribution] = await pool.execute(`
      SELECT 
        CASE 
          WHEN age < 18 THEN '0-17'
          WHEN age BETWEEN 18 AND 30 THEN '18-30'
          WHEN age BETWEEN 31 AND 50 THEN '31-50'
          WHEN age > 50 THEN '51+'
          ELSE 'Unknown'
        END as age_group,
        COUNT(*) as count
      FROM martyrs 
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN '0-17' THEN 1
          WHEN '18-30' THEN 2
          WHEN '31-50' THEN 3
          WHEN '51+' THEN 4
          ELSE 5
        END
    `);

    // Recent martyrs (last 30 days)
    const [recentMartyrs] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM martyrs 
      WHERE date_of_martyrdom >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    // Total tributes
    const [totalTributes] = await pool.execute('SELECT COUNT(*) as total FROM tributes WHERE is_approved = TRUE');

    res.json({
      totalMartyrs: totalMartyrs[0].total,
      martyrsByYear,
      martyrsByCity,
      ageDistribution,
      recentMartyrs: recentMartyrs[0].count,
      totalTributes: totalTributes[0].total
    });
  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({ error: 'Failed to fetch overview statistics' });
  }
});

// Get detailed statistics (Admin only)
router.get('/detailed', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // All overview stats plus additional admin-only data
    const [totalMartyrs] = await pool.execute('SELECT COUNT(*) as total FROM martyrs');
    const [pendingTributes] = await pool.execute('SELECT COUNT(*) as pending FROM tributes WHERE is_approved = FALSE');
    const [totalTributes] = await pool.execute('SELECT COUNT(*) as total FROM tributes');
    const [totalAdmins] = await pool.execute('SELECT COUNT(*) as total FROM admins WHERE is_active = TRUE');

    // Monthly trends (last 12 months)
    const [monthlyTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(date_of_martyrdom, '%Y-%m') as month,
        COUNT(*) as martyr_count
      FROM martyrs 
      WHERE date_of_martyrdom >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(date_of_martyrdom, '%Y-%m')
      ORDER BY month DESC
    `);

    // Tributes by month
    const [tributesByMonth] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as tribute_count
      FROM tributes 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    // Top locations
    const [topLocations] = await pool.execute(`
      SELECT 
        place_of_martyrdom,
        COUNT(*) as count
      FROM martyrs 
      GROUP BY place_of_martyrdom
      ORDER BY count DESC
      LIMIT 20
    `);

    // Education and occupation statistics
    const [educationStats] = await pool.execute(`
      SELECT 
        education,
        COUNT(*) as count
      FROM martyrs 
      WHERE education IS NOT NULL AND education != ''
      GROUP BY education
      ORDER BY count DESC
      LIMIT 10
    `);

    const [occupationStats] = await pool.execute(`
      SELECT 
        occupation,
        COUNT(*) as count
      FROM martyrs 
      WHERE occupation IS NOT NULL AND occupation != ''
      GROUP BY occupation
      ORDER BY count DESC
      LIMIT 10
    `);

    // Recent activity (last 7 days)
    const [recentActivity] = await pool.execute(`
      SELECT 
        'martyrs' as type,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM martyrs 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      UNION ALL
      SELECT 
        'tributes' as type,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM tributes 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC, type
    `);

    res.json({
      overview: {
        totalMartyrs: totalMartyrs[0].total,
        pendingTributes: pendingTributes[0].pending,
        totalTributes: totalTributes[0].total,
        totalAdmins: totalAdmins[0].total
      },
      monthlyTrends,
      tributesByMonth,
      topLocations,
      educationStats,
      occupationStats,
      recentActivity
    });
  } catch (error) {
    console.error('Detailed stats error:', error);
    res.status(500).json({ error: 'Failed to fetch detailed statistics' });
  }
});

// Get map data for interactive map
router.get('/map', async (req, res) => {
  try {
    const [mapData] = await pool.execute(`
      SELECT 
        place_of_martyrdom,
        COUNT(*) as count,
        MIN(date_of_martyrdom) as earliest_date,
        MAX(date_of_martyrdom) as latest_date
      FROM martyrs 
      GROUP BY place_of_martyrdom
      ORDER BY count DESC
    `);

    res.json(mapData);
  } catch (error) {
    console.error('Map data error:', error);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
});

// Get export data (Admin only)
router.get('/export', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    const { format = 'json' } = req.query;

    if (format === 'json') {
      const [martyrs] = await pool.execute(`
        SELECT 
          id,
          name_ar,
          name_en,
          image_url,
          place_of_martyrdom,
          date_of_martyrdom,
          education_level,
          occupation,
          bio,
          created_at,
          updated_at
        FROM martyrs 
        ORDER BY date_of_martyrdom DESC
      `);

      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: martyrs.length,
        data: martyrs
      });
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Get search analytics (Admin only)
router.get('/search-analytics', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // Most searched terms (if you implement search logging)
    // For now, return popular names and locations
    const [popularNames] = await pool.execute(`
      SELECT 
        name_ar,
        COUNT(*) as search_count
      FROM martyrs 
      GROUP BY name_ar
      ORDER BY search_count DESC
      LIMIT 10
    `);

    const [popularLocations] = await pool.execute(`
      SELECT 
        place_of_martyrdom,
        COUNT(*) as search_count
      FROM martyrs 
      GROUP BY place_of_martyrdom
      ORDER BY search_count DESC
      LIMIT 10
    `);

    res.json({
      popularNames,
      popularLocations
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch search analytics' });
  }
});

module.exports = router;
