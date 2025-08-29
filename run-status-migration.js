const mysql = require('mysql2/promise');
require('dotenv').config();

async function runStatusMigration() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'martyrs_archive',
      charset: 'utf8mb4'
    });

    console.log('🔗 Connected to database');
    console.log('🔄 Running status migration...');

    // Check if status column already exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'martyrs' AND COLUMN_NAME = 'status'
    `, [process.env.DB_NAME || 'martyrs_archive']);

    if (columns.length > 0) {
      console.log('✅ Status column already exists, skipping migration');
      return;
    }

    // Add status field to martyrs table
    await connection.execute(`
      ALTER TABLE martyrs 
      ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' 
      COMMENT 'Status of martyr record: pending, approved, or rejected'
    `);

    // Add index for better performance
    await connection.execute(`
      ALTER TABLE martyrs 
      ADD INDEX idx_status (status)
    `);

    // Migrate existing data: convert approved boolean to status
    await connection.execute(`
      UPDATE martyrs 
      SET status = CASE 
          WHEN approved = TRUE THEN 'approved'
          WHEN approved = FALSE THEN 'pending'
          ELSE 'pending'
      END
    `);

    // Get migration summary
    const [totalResult] = await connection.execute('SELECT COUNT(*) as total FROM martyrs');
    const [statusResult] = await connection.execute('SELECT status, COUNT(*) as count FROM martyrs GROUP BY status');
    const [approvedResult] = await connection.execute('SELECT COUNT(*) as count FROM martyrs WHERE status = "approved"');
    const [pendingResult] = await connection.execute('SELECT COUNT(*) as count FROM martyrs WHERE status = "pending"');
    const [rejectedResult] = await connection.execute('SELECT COUNT(*) as count FROM martyrs WHERE status = "rejected"');

    console.log('✅ Migration completed successfully!');
    console.log(`📊 Total martyrs: ${totalResult[0].total}`);
    console.log('📈 Status breakdown:');
    statusResult.forEach(row => {
      console.log(`   - ${row.status}: ${row.count}`);
    });
    console.log(`✅ Approved: ${approvedResult[0].count}`);
    console.log(`⏳ Pending: ${pendingResult[0].count}`);
    console.log(`❌ Rejected: ${rejectedResult[0].count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runStatusMigration();
}

module.exports = { runStatusMigration };
