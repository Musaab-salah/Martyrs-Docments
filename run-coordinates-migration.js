const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function runCoordinatesMigration() {
  let connection;
  
  try {
    console.log('🚀 Starting coordinates migration...');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'martyrs_archive',
      charset: 'utf8mb4'
    });

    console.log('✅ Connected to database');

    // Read migration SQL
    const migrationPath = path.join(__dirname, 'database', 'migration_add_coordinates.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await connection.execute(statement);
          console.log('✅ Statement executed successfully');
        } catch (error) {
          // If it's a "duplicate column" error, that's okay
          if (error.message.includes('Duplicate column name') || 
              error.message.includes('Duplicate key name')) {
            console.log('⚠️  Column/index already exists, skipping...');
          } else {
            console.log(`❌ Statement failed: ${error.message}`);
            throw error;
          }
        }
      }
    }

    console.log('✅ Coordinates migration completed successfully!');
    
    // Show summary
    const [martyrs] = await connection.execute('SELECT COUNT(*) as total FROM martyrs');
    
    console.log('\n📊 Migration Summary:');
    console.log(`Total martyrs: ${martyrs[0].total}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runCoordinatesMigration();
}

module.exports = runCoordinatesMigration;
