const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'martyrs_archive',
  charset: 'utf8mb4'
};

async function checkMartyr20() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Check martyr with ID 20 - get all fields
    const [result] = await connection.execute(
      'SELECT * FROM martyrs WHERE id = ?',
      [20]
    );

    if (result.length === 0) {
      console.log('❌ Martyr with ID 20 does not exist');
      return;
    }

    const martyr = result[0];
    console.log('📋 Martyr Details:');
    console.log(`   ID: ${martyr.id}`);
    console.log(`   Name (Arabic): ${martyr.name_ar}`);
    console.log(`   Name (English): ${martyr.name_en}`);
    console.log(`   Approved: ${martyr.approved}`);
    console.log(`   Status: ${martyr.status || 'NULL'}`);
    console.log(`   Date of Martyrdom: ${martyr.date_of_martyrdom}`);
    console.log(`   Created At: ${martyr.created_at}`);
    console.log(`   Updated At: ${martyr.updated_at}`);

    // Check if there's a status column
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'martyrs' AND COLUMN_NAME = 'status'
    `, [process.env.DB_NAME || 'martyrs_archive']);

    if (columns.length > 0) {
      console.log('✅ Status column exists');
      
      // Check what the status condition would be
      const statusCondition = martyr.status === 'approved' ? 'status = "approved"' : 'approved = TRUE';
      console.log(`📋 Status condition would be: ${statusCondition}`);
      
      // Test the query that the API uses
      const [apiResult] = await connection.execute(
        `SELECT id, name_ar, approved, status FROM martyrs WHERE id = ? AND ${statusCondition}`,
        [20]
      );
      
      console.log(`📋 API query result: ${apiResult.length} records found`);
      if (apiResult.length > 0) {
        console.log(`   Found: ${apiResult[0].name_ar}`);
      }
    } else {
      console.log('❌ Status column does not exist');
      
      // Test the query that the API uses
      const [apiResult] = await connection.execute(
        'SELECT id, name_ar, approved FROM martyrs WHERE id = ? AND approved = TRUE',
        [20]
      );
      
      console.log(`📋 API query result: ${apiResult.length} records found`);
      if (apiResult.length > 0) {
        console.log(`   Found: ${apiResult[0].name_ar}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking martyr:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the function
checkMartyr20();
