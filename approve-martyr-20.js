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

async function approveMartyr20() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Check if martyr with ID 20 exists
    const [existing] = await connection.execute(
      'SELECT id, name_ar, approved, status FROM martyrs WHERE id = ?',
      [20]
    );

    if (existing.length === 0) {
      console.log('❌ Martyr with ID 20 does not exist');
      return;
    }

    console.log(`📋 Found martyr: ${existing[0].name_ar}`);
    console.log(`📋 Current approval status: ${existing[0].approved ? 'Approved' : 'Not Approved'}`);
    console.log(`📋 Current status: ${existing[0].status}`);

    // Update both approved and status fields
    await connection.execute(
      'UPDATE martyrs SET approved = TRUE, status = "approved" WHERE id = ?',
      [20]
    );

    console.log('✅ Martyr with ID 20 has been approved successfully');

    // Verify the update
    const [result] = await connection.execute(
      'SELECT id, name_ar, name_en, approved, status FROM martyrs WHERE id = ?',
      [20]
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
    console.error('❌ Error approving martyr:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the function
approveMartyr20();
