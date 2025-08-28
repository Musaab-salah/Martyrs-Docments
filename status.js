const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function showStatus() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'martyrs_archive',
    });

    console.log('🔍 Checking application status...\n');

    // Check database
    const [martyrs] = await connection.execute('SELECT COUNT(*) as total FROM martyrs');
    const [martyrsWithImages] = await connection.execute('SELECT COUNT(*) as total FROM martyrs WHERE image_url IS NOT NULL AND image_url != ""');
    
    console.log('📊 Database Status:');
    console.log(`   Total martyrs: ${martyrs[0].total}`);
    console.log(`   Martyrs with images: ${martyrsWithImages[0].total}`);
    console.log(`   Martyrs without images: ${martyrs[0].total - martyrsWithImages[0].total}`);

    // Check uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    const martyrsDir = path.join(__dirname, 'uploads/martyrs');
    
    console.log('\n📁 File System Status:');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir).filter(f => f.match(/\.(jpg|jpeg|png|gif)$/i));
      console.log(`   Main uploads directory: ${files.length} image files`);
    } else {
      console.log('   ❌ Main uploads directory does not exist');
    }

    if (fs.existsSync(martyrsDir)) {
      const files = fs.readdirSync(martyrsDir).filter(f => f.match(/\.(jpg|jpeg|png|gif)$/i));
      console.log(`   Martyrs subdirectory: ${files.length} image files`);
    } else {
      console.log('   ❌ Martyrs subdirectory does not exist');
    }

    // Check for broken image references
    const [brokenImages] = await connection.execute(`
      SELECT id, name_ar, image_url 
      FROM martyrs 
      WHERE image_url IS NOT NULL AND image_url != ''
    `);

    let brokenCount = 0;
    for (const martyr of brokenImages) {
      const imagePath = martyr.image_url.startsWith('/') 
        ? martyr.image_url.substring(1) 
        : martyr.image_url;
      const fullPath = path.join(__dirname, imagePath);
      if (!fs.existsSync(fullPath)) {
        brokenCount++;
      }
    }

    console.log('\n🔧 Image Status:');
    console.log(`   Broken image references: ${brokenCount}`);
    
    if (brokenCount === 0) {
      console.log('   ✅ All image references are valid!');
    } else {
      console.log('   ⚠️  Some image references are broken');
    }

    console.log('\n🎯 Summary:');
    if (brokenCount === 0) {
      console.log('   ✅ Application is healthy - no broken image references');
    } else {
      console.log('   ⚠️  Application has broken image references that need fixing');
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Start the server: cd server && npm start');
    console.log('   2. Start the client: cd client && npm start');
    console.log('   3. Access the application at http://localhost:3000');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

showStatus();
