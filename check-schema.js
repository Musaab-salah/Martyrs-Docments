const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config();

async function checkSchema() {
  let connection;
  
  try {
    console.log('🔍 Checking database schema...');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'martyrs_archive',
      charset: 'utf8mb4'
    });

    console.log('✅ Connected to database');

    // Check table structure
    const [columns] = await connection.execute('DESCRIBE martyrs');
    
    console.log('\n📋 Martyrs table structure:');
    console.table(columns);

    // Check for required columns
    const requiredColumns = ['id', 'name_ar', 'name_en', 'date_of_martyrdom', 'place_of_martyrdom', 'education_level', 'occupation'];
    const missingColumns = requiredColumns.filter(col => !columns.some(c => c.Field === col));
    
    console.log('\n📍 Required columns status:');
    if (missingColumns.length === 0) {
      console.log('✅ All required columns exist!');
    } else {
      console.log(`❌ Missing columns: ${missingColumns.join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run check if this script is executed directly
if (require.main === module) {
  checkSchema();
}

module.exports = checkSchema;
