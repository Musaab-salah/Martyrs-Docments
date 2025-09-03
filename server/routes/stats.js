const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Get overall statistics (Public)
router.get('/overview', async (req, res) => {
  try {
    // Total martyrs
    const [totalMartyrs] = await pool.execute('SELECT COUNT(*) as total FROM martyrs WHERE status = "approved"');
    
    // Martyrs by year
    const [martyrsByYear] = await pool.execute(`
      SELECT 
        YEAR(date_of_martyrdom) as year,
        COUNT(*) as count
      FROM martyrs 
      WHERE status = "approved"
      GROUP BY YEAR(date_of_martyrdom)
      ORDER BY year DESC
    `);

    // Martyrs by city/region
    const [martyrsByCity] = await pool.execute(`
      SELECT 
        place_of_martyrdom,
        COUNT(*) as count
      FROM martyrs 
      WHERE status = "approved"
      GROUP BY place_of_martyrdom
      ORDER BY count DESC
      LIMIT 10
    `);

    // Education distribution
    const [educationDistribution] = await pool.execute(`
      SELECT 
        education_level,
        COUNT(*) as count
      FROM martyrs 
      WHERE status = "approved"
      GROUP BY education_level
      ORDER BY count DESC
    `);

    // Recent martyrs (last 30 days)
    const [recentMartyrs] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM martyrs 
      WHERE status = "approved" AND date_of_martyrdom >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    // Total tributes
    const [totalTributes] = await pool.execute('SELECT COUNT(*) as total FROM tributes WHERE is_approved = TRUE');

    res.json({
      totalMartyrs: totalMartyrs[0].total,
      martyrsByYear,
      martyrsByCity,
      educationDistribution,
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
    const [pendingMartyrs] = await pool.execute('SELECT COUNT(*) as pending FROM martyrs WHERE status = "pending"');
    const [approvedMartyrs] = await pool.execute('SELECT COUNT(*) as approved FROM martyrs WHERE status = "approved"');
    const [rejectedMartyrs] = await pool.execute('SELECT COUNT(*) as rejected FROM martyrs WHERE status = "rejected"');
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
        education_level,
        COUNT(*) as count
      FROM martyrs 
      WHERE education_level IS NOT NULL AND education_level != ''
      GROUP BY education_level
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
        pendingMartyrs: pendingMartyrs[0].pending,
        approvedMartyrs: approvedMartyrs[0].approved,
        rejectedMartyrs: rejectedMartyrs[0].rejected,
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
      WHERE status = "approved"
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
          status,
          approved,
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
    // Most popular names and locations
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
