const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const { pool } = require('../config/database');

// Get admin dashboard data
router.get('/dashboard', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // Quick stats
    const [totalMartyrs] = await pool.execute('SELECT COUNT(*) as total FROM martyrs');
    const [pendingTributes] = await pool.execute('SELECT COUNT(*) as pending FROM tributes WHERE is_approved = FALSE');
    const [totalTributes] = await pool.execute('SELECT COUNT(*) as total FROM tributes WHERE is_approved = TRUE');
    const [recentMartyrs] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM martyrs 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Recent activity
    const [recentActivity] = await pool.execute(`
      SELECT 
        'martyr' as type,
        id,
        name_ar as title,
        created_at
      FROM martyrs 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 
        'tribute' as type,
        id,
        CONCAT('Tribute for ', (SELECT name_ar FROM martyrs WHERE id = t.martyr_id)) as title,
        created_at
      FROM tributes t
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // System health
    const [systemHealth] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM martyrs) as total_martyrs,
        (SELECT COUNT(*) FROM tributes) as total_tributes,
        (SELECT COUNT(*) FROM admins WHERE is_active = TRUE) as active_admins,
        (SELECT COUNT(*) FROM tributes WHERE is_approved = FALSE) as pending_tributes
    `);

    res.json({
      quickStats: {
        totalMartyrs: totalMartyrs[0].total,
        pendingTributes: pendingTributes[0].pending,
        totalTributes: totalTributes[0].total,
        recentMartyrs: recentMartyrs[0].count
      },
      recentActivity,
      systemHealth: systemHealth[0]
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get system settings (Super admin only)
router.get('/settings', [authenticateToken, requireSuperAdmin], async (req, res) => {
  try {
    // For now, return default settings
    // In a real application, you'd store these in a database
    const settings = {
      siteName: 'Martyrs Archive',
      siteDescription: 'Digital archive for documenting martyrs with respect and organization',
      contactEmail: 'admin@martyrsarchive.com',
      maxFileSize: '5MB',
      allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif'],
      autoApproveTributes: false,
      requireAdminApproval: true,
      maxTributesPerDay: 1,
      enableSocialSharing: true,
      enableMap: true,
      enableStatistics: true
    };

    res.json(settings);
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update system settings (Super admin only)
router.put('/settings', [authenticateToken, requireSuperAdmin], async (req, res) => {
  try {
    const {
      siteName,
      siteDescription,
      contactEmail,
      autoApproveTributes,
      requireAdminApproval,
      maxTributesPerDay,
      enableSocialSharing,
      enableMap,
      enableStatistics
    } = req.body;

    // In a real application, you'd update these in a database
    // For now, just return success
    res.json({
      message: 'Settings updated successfully',
      settings: {
        siteName,
        siteDescription,
        contactEmail,
        autoApproveTributes,
        requireAdminApproval,
        maxTributesPerDay,
        enableSocialSharing,
        enableMap,
        enableStatistics
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get backup status (Super admin only)
router.get('/backup', [authenticateToken, requireSuperAdmin], async (req, res) => {
  try {
    // In a real application, you'd implement actual backup functionality
    const backupInfo = {
      lastBackup: new Date().toISOString(),
      backupSize: '2.5MB',
      backupLocation: '/backups/',
      autoBackup: true,
      backupFrequency: 'daily',
      nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    res.json(backupInfo);
  } catch (error) {
    console.error('Backup info error:', error);
    res.status(500).json({ error: 'Failed to fetch backup information' });
  }
});

// Trigger manual backup (Super admin only)
router.post('/backup', [authenticateToken, requireSuperAdmin], async (req, res) => {
  try {
    // In a real application, you'd implement actual backup functionality
    // For now, just return success
    res.json({
      message: 'Backup initiated successfully',
      backupId: Date.now(),
      estimatedTime: '2-3 minutes'
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Failed to initiate backup' });
  }
});

// Get system logs (Super admin only)
router.get('/logs', [authenticateToken, requireSuperAdmin], async (req, res) => {
  try {
    const { type = 'all', limit = 100 } = req.query;

    // In a real application, you'd implement actual logging
    // For now, return mock logs
    const logs = [
      {
        id: 1,
        level: 'info',
        message: 'System started successfully',
        timestamp: new Date().toISOString(),
        user: 'system'
      },
      {
        id: 2,
        level: 'info',
        message: 'New martyr added: John Doe',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user: 'admin'
      },
      {
        id: 3,
        level: 'warning',
        message: 'High memory usage detected',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        user: 'system'
      }
    ];

    res.json({
      logs: logs.slice(0, parseInt(limit)),
      total: logs.length
    });
  } catch (error) {
    console.error('Logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get user activity (Super admin only)
router.get('/activity', [authenticateToken, requireSuperAdmin], async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Get admin login activity
    const [adminActivity] = await pool.execute(`
      SELECT 
        a.username,
        a.last_login,
        a.role,
        COUNT(m.id) as martyrs_added,
        COUNT(t.id) as tributes_approved
      FROM admins a
      LEFT JOIN martyrs m ON a.id = m.created_by
      LEFT JOIN tributes t ON a.id = t.approved_by
      WHERE a.is_active = TRUE
      GROUP BY a.id
      ORDER BY a.last_login DESC
    `);

    // Get recent admin actions
    const [recentActions] = await pool.execute(`
      SELECT 
        'martyr_added' as action,
        m.name_ar as details,
        m.created_at as timestamp
      FROM martyrs m
      WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      UNION ALL
      SELECT 
        'tribute_approved' as action,
        CONCAT('Tribute for ', m.name_ar) as details,
        t.updated_at as timestamp
      FROM tributes t
      JOIN martyrs m ON t.martyr_id = m.id
      WHERE t.is_approved = TRUE 
        AND t.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY timestamp DESC
      LIMIT 50
    `, [days, days]);

    res.json({
      adminActivity,
      recentActions
    });
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity data' });
  }
});

// Get system health check
router.get('/health', [authenticateToken, requireAdmin], async (req, res) => {
  try {
    // Check database connection
    const [dbCheck] = await pool.execute('SELECT 1 as status');
    
    // Check disk space (mock)
    const diskSpace = {
      total: '100GB',
      used: '25GB',
      available: '75GB',
      usage: '25%'
    };

    // Check memory usage (mock)
    const memoryUsage = {
      total: '8GB',
      used: '2.5GB',
      available: '5.5GB',
      usage: '31%'
    };

    const healthStatus = {
      database: dbCheck.length > 0 ? 'healthy' : 'error',
      diskSpace: diskSpace.usage < '80%' ? 'healthy' : 'warning',
      memory: memoryUsage.usage < '80%' ? 'healthy' : 'warning',
      overall: 'healthy'
    };

    res.json({
      status: healthStatus,
      details: {
        database: dbCheck.length > 0 ? 'Connected' : 'Connection failed',
        diskSpace,
        memoryUsage
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
