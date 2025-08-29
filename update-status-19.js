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

async function updateStatus19() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Update the status to approved
    await connection.execute(
      'UPDATE martyrs SET status = "approved" WHERE id = ?',
      [19]
    );

    console.log('✅ Status updated to "approved" successfully');

    // Verify the update
    const [result] = await connection.execute(
      'SELECT id, name_ar, name_en, approved, status FROM martyrs WHERE id = ?',
      [19]
    );

    if (result.length > 0) {
      console.log('✅ Verification successful:');
      console.log(`   ID: ${result[0].id}`);
      console.log(`   Name (Arabic): ${result[0].name_ar}`);
      console.log(`   Name (English): ${result[0].name_en}`);
      console.log(`   Approved: ${result[0].approved ? 'Yes' : 'No'}`);
      console.log(`   Status: ${result[0].status}`);
    }

  } catch (error) {
    console.error('❌ Error updating status:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the function
updateStatus19();
