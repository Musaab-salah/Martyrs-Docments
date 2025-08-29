#!/usr/bin/env node

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log('🚀 Martyrs Archive Setup Script');
console.log('================================\n');

async function setupDatabase() {
  let connection;
  
  try {
    // Create connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('✅ Connected to MySQL server');

    // Create database if not exists
    const dbName = process.env.DB_NAME || 'martyrs_archive';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' created/verified`);

    // Use the database
    await connection.execute(`USE ${dbName}`);

    // Create tables
    console.log('📋 Creating database tables...');

    // Martyrs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS martyrs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        photo_url VARCHAR(500),
        place_of_martyrdom VARCHAR(255) NOT NULL,
        date_of_martyrdom DATE NOT NULL,
        age INT,
        biography TEXT,
        education VARCHAR(500),
        occupation VARCHAR(255),
        role VARCHAR(255),
        personal_story TEXT,
        attachments JSON,
        coordinates JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (full_name),
        INDEX idx_location (place_of_martyrdom),
        INDEX idx_date (date_of_martyrdom)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Admins table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin', 'super_admin') DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tributes table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tributes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        martyr_id INT NOT NULL,
        visitor_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (martyr_id) REFERENCES martyrs(id) ON DELETE CASCADE,
        INDEX idx_martyr_id (martyr_id),
        INDEX idx_approved (is_approved)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Media gallery table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS media_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_url VARCHAR(500) NOT NULL,
        file_type ENUM('image', 'video', 'document') NOT NULL,
        category VARCHAR(100),
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_public (is_public)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Statistics table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS statistics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        stat_type VARCHAR(100) UNIQUE NOT NULL,
        stat_value JSON NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ All tables created successfully');

    // Create default super admin account
    console.log('👤 Creating default admin account...');
    
    const [existingAdmins] = await connection.execute('SELECT id FROM admins WHERE username = ?', ['sudansust']);
    
    if (existingAdmins.length === 0) {
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash('sust@1989', saltRounds);
      
      await connection.execute(`
        INSERT INTO admins (username, email, password_hash, role, is_active) 
        VALUES (?, ?, ?, ?, ?)
      `, ['sudansust', 'sudansust@martyrsarchive.com', passwordHash, 'super_admin', true]);
      
      console.log('✅ Default admin account created');
      console.log('   Username: sudansust');
      console.log('   Password: sust@1989');
      console.log('   ⚠️  Please change these credentials immediately after first login!');
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    // Insert sample data if tables are empty
    console.log('📊 Checking for sample data...');
    
    const [martyrCount] = await connection.execute('SELECT COUNT(*) as count FROM martyrs');
    
    if (martyrCount[0].count === 0) {
      console.log('📝 Inserting sample data...');
      
      // Sample martyrs
      const sampleMartyrs = [
        ['Ahmad Al-Masri', 'Gaza City', '2023-10-15', 25, 'Ahmad was a dedicated teacher who believed in the power of education to change lives.', 'Bachelor of Mathematics', 'Teacher', 'Educator'],
        ['Fatima Al-Zahra', 'Rafah', '2023-11-20', 32, 'Fatima was a nurse who dedicated her life to helping others.', 'Nursing Degree', 'Nurse', 'Healthcare Worker'],
        ['Omar Al-Hassan', 'Khan Yunis', '2023-12-05', 28, 'Omar was a civil engineer who worked on infrastructure projects to improve his community.', 'Civil Engineering Degree', 'Engineer', 'Infrastructure Developer']
      ];
      
      for (const martyr of sampleMartyrs) {
        await connection.execute(`
          INSERT INTO martyrs (full_name, place_of_martyrdom, date_of_martyrdom, age, biography, education, occupation, role) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, martyr);
      }
      
      console.log('✅ Sample data inserted');
    } else {
      console.log('ℹ️  Sample data already exists');
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: npm run server');
    console.log('2. Start the client: npm run client');
    console.log('3. Visit http://localhost:3000');
    console.log('4. Login to admin panel at http://localhost:3000/admin/login');
    console.log('5. Change default admin credentials');
    console.log('\n🔧 Configuration:');
    console.log('- Edit .env file for custom settings');
    console.log('- Add Google Maps API key for interactive map');
    console.log('- Configure email settings for notifications');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupDatabase();
