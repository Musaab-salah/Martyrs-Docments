#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('🔐 Updating Admin Credentials');
console.log('=============================\n');

async function updateAdminCredentials() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'martyrs_archive',
    });

    console.log('✅ Connected to database');

    // Check if admin exists
    const [existingAdmins] = await connection.execute('SELECT id FROM admins WHERE username = ?', ['admin']);
    
    if (existingAdmins.length > 0) {
      // Update existing admin
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash('sust@1989', saltRounds);
      
      await connection.execute(`
        UPDATE admins 
        SET username = ?, email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE username = ?
      `, ['sudansust', 'sudansust@martyrsarchive.com', passwordHash, 'admin']);
      
      console.log('✅ Admin credentials updated');
      console.log('   New Username: sudansust');
      console.log('   New Password: sust@1989');
    } else {
      // Create new admin if none exists
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash('sust@1989', saltRounds);
      
      await connection.execute(`
        INSERT INTO admins (username, email, password_hash, role, is_active) 
        VALUES (?, ?, ?, ?, ?)
      `, ['sudansust', 'sudansust@martyrsarchive.com', passwordHash, 'super_admin', true]);
      
      console.log('✅ New admin account created');
      console.log('   Username: sudansust');
      console.log('   Password: sust@1989');
    }

    console.log('\n🎉 Admin credentials updated successfully!');

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run update
updateAdminCredentials();
