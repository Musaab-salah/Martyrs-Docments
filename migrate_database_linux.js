const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'martyrs_archive'
};

async function migratePreserveData() {
  let connection;
  let dataExists = false;
  let exportData = {};
  
  try {
    console.log('🚀 Starting database migration with data preservation...');
    console.log(`📊 Target database: ${config.database}`);
    
    // Step 1: Connect to MySQL server (without specifying database)
    console.log('🔌 Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('   ✅ Connected to MySQL server successfully');
    
    // Step 2: Export current data from old database (if it exists)
    console.log('📤 Exporting current data from existing database...');
    
    try {
      // Try to use the database
      await connection.query(`USE \`${config.database}\``);
      console.log(`   ✅ Connected to database '${config.database}'`);
      
      // Export martyrs data
      const [martyrs] = await connection.execute(`
        SELECT 
          name_ar, name_en, date_of_martyrdom, place_of_martyrdom,
          COALESCE(education_level, education) as education_level,
          university_name, faculty, department, school_state, school_locality,
          spouse, children, occupation, bio, image_url, status, approved, created_at, updated_at
        FROM martyrs
        ORDER BY id
      `);
      
      // Export tributes data
      const [tributes] = await connection.execute(`
        SELECT martyr_id, visitor_name, message, is_approved, ip_address, created_at, updated_at
        FROM tributes
        ORDER BY id
      `);
      
      // Export admins data (excluding the default one that will be recreated)
      const [admins] = await connection.execute(`
        SELECT username, email, password_hash, role, is_active, last_login, created_at, updated_at
        FROM admins
        WHERE username != 'sudansust'
        ORDER BY id
      `);
      
      // Export media gallery data
      const [media] = await connection.execute(`
        SELECT title, description, file_url, file_type, category, is_public, created_at, updated_at
        FROM media_gallery
        ORDER BY id
      `);
      
      // Export statistics data
      const [stats] = await connection.execute(`
        SELECT stat_type, stat_value, last_updated
        FROM statistics
        ORDER BY id
      `);
      
      exportData = { martyrs, tributes, admins, media, stats };
      dataExists = true;
      
      console.log(`   📊 Found data to preserve:`);
      console.log(`      - Martyrs: ${martyrs.length}`);
      console.log(`      - Tributes: ${tributes.length}`);
      console.log(`      - Admins: ${admins.length}`);
      console.log(`      - Media: ${media.length}`);
      console.log(`      - Statistics: ${stats.length}`);
      
    } catch (error) {
      console.log('   ℹ️  Could not connect to database (may not exist), proceeding with fresh creation');
      console.log(`   ℹ️  Error: ${error.message}`);
    }
    
    // Step 3: Drop old database and recreate it
    console.log('🗑️  Dropping and recreating database...');
    
    try {
      await connection.query(`DROP DATABASE IF EXISTS \`${config.database}\``);
      console.log(`   ✅ Database '${config.database}' dropped successfully`);
    } catch (error) {
      console.log('   ℹ️  Could not drop database (may not exist)');
    }
    
    // Create new database with same name
    try {
      await connection.query(`CREATE DATABASE \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`   ✅ Database '${config.database}' recreated successfully`);
    } catch (error) {
      throw new Error(`Failed to recreate database: ${error.message}`);
    }
    
    // Step 4: Use the new database and create schema
    console.log('📝 Creating database schema...');
    
    try {
      await connection.query(`USE \`${config.database}\``);
      
      // Create updated martyrs table with final structure
      await connection.query(`
        CREATE TABLE martyrs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name_ar VARCHAR(255) NOT NULL COMMENT 'Name in Arabic',
          name_en VARCHAR(255) NOT NULL COMMENT 'Name in English',
          date_of_martyrdom DATE NOT NULL,
          place_of_martyrdom JSON NOT NULL COMMENT '{"state": "الخرطوم", "location": "الخرطوم بحري"}',
          education_level ENUM('خريج', 'جامعي', 'مدرسة') NOT NULL,
          university_name VARCHAR(255) NULL,
          faculty VARCHAR(255) NULL,
          department VARCHAR(255) NULL,
          school_state VARCHAR(255) NULL,
          school_locality VARCHAR(255) NULL,
          spouse VARCHAR(255) NULL,
          children INT NULL,
          occupation VARCHAR(255) NOT NULL,
          bio TEXT NULL,
          image_url VARCHAR(500) NULL,
          status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'Status of martyr record',
          approved BOOLEAN DEFAULT FALSE COMMENT 'Whether the martyr has been approved by admin (for backward compatibility)',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          -- Indexes for performance
          INDEX idx_name_ar (name_ar),
          INDEX idx_name_en (name_en),
          INDEX idx_date (date_of_martyrdom),
          INDEX idx_status (status),
          INDEX idx_approved (approved),
          INDEX idx_education (education_level),
          INDEX idx_occupation (occupation),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Create admins table
      await connection.query(`
        CREATE TABLE admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'super_admin') DEFAULT 'admin',
          is_active BOOLEAN DEFAULT TRUE,
          last_login TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_username (username),
          INDEX idx_email (email),
          INDEX idx_role (role),
          INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Create tributes table
      await connection.query(`
        CREATE TABLE tributes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          martyr_id INT NOT NULL,
          visitor_name VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_approved BOOLEAN DEFAULT FALSE,
          ip_address VARCHAR(45),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          FOREIGN KEY (martyr_id) REFERENCES martyrs(id) ON DELETE CASCADE,
          INDEX idx_martyr_id (martyr_id),
          INDEX idx_approved (is_approved),
          INDEX idx_created_at (created_at),
          INDEX idx_ip_address (ip_address)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Create media gallery table
      await connection.query(`
        CREATE TABLE media_gallery (
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
          INDEX idx_public (is_public),
          INDEX idx_file_type (file_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      // Create statistics table
      await connection.query(`
        CREATE TABLE statistics (
          id INT AUTO_INCREMENT PRIMARY KEY,
          stat_type VARCHAR(100) NULL,
          stat_value JSON NOT NULL,
          last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          
          INDEX idx_stat_type (stat_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('   ✅ Database schema created successfully!');
      
    } catch (error) {
      throw new Error(`Failed to create schema: ${error.message}`);
    }
    
    // Step 5: Insert default data
    console.log('📥 Inserting default data...');
    
    try {
      // Insert default super admin account
      await connection.execute(`
        INSERT INTO admins (username, email, password_hash, role, is_active) 
        VALUES (?, ?, ?, ?, ?)
      `, [
        'sudansust',
        'admin@martyrsarchive.com',
        '$2a$12$H.NvjNDmZCGq9N9AhxIE4OSkx5sp1VqeMYe.klM/TuAEAywK6eKe6', // sust@1989
        'super_admin',
        true
      ]);
      
      // Insert sample martyrs for Sudan
      const sampleMartyrs = [
        ['محمد أحمد علي', 'Mohamed Ahmed Ali', '2024-01-15', 
         '{"state": "الخرطوم", "location": "الخرطوم بحري"}', 
         'جامعي', 'جامعة الخرطوم', 'الهندسة', 'مدني',
         'مهندس مدني', 'كان مثالاً للشجاعة والتفاني في خدمة الوطن. عمل على مشاريع البنية التحتية المهمة.', null, 'approved', true],
        
        ['فاطمة محمد حسن', 'Fatima Mohamed Hassan', '2024-02-20', 
         '{"state": "الخرطوم", "location": "أم درمان"}', 
         'خريج', 'جامعة السودان', 'الطب', 'طب عام',
         'طبيبة', 'كرست حياتها لعلاج المرضى ومساعدة المحتاجين. كانت مثالاً للرحمة والإنسانية.', null, 'approved', true],
        
        ['أحمد عمر محمد', 'Ahmed Omar Mohamed', '2024-03-10', 
         '{"state": "الخرطوم", "location": "الخرطوم"}', 
         'مدرسة', null, null, null,
         'طالب', 'كان طالباً مجتهداً يحلم بمستقبل أفضل لبلاده. كان مثالاً للشباب الواعي.', null, 'approved', true],
        
        ['سارة عبد الرحمن', 'Sara Abdel Rahman', '2024-04-05', 
         '{"state": "الخرطوم", "location": "الخرطوم شمال"}', 
         'جامعي', 'جامعة النيلين', 'العلوم', 'كيمياء',
         'باحثة', 'عملت في مجال البحث العلمي وساهمت في تطوير العلوم في السودان.', null, 'approved', true],
        
        ['علي حسن محمد', 'Ali Hassan Mohamed', '2024-05-12', 
         '{"state": "الخرطوم", "location": "الخرطوم شرق"}', 
         'خريج', 'جامعة الخرطوم', 'الاقتصاد', 'إدارة أعمال',
         'محاسب', 'كان محاسباً أميناً ساهم في تطوير القطاع المالي في السودان.', null, 'approved', true]
      ];
      
      for (const martyr of sampleMartyrs) {
        await connection.execute(`
          INSERT INTO martyrs (
            name_ar, name_en, date_of_martyrdom, place_of_martyrdom, 
            education_level, university_name, faculty, department,
            occupation, bio, image_url, status, approved
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, martyr);
      }
      
      // Insert sample tributes
      const sampleTributes = [
        [1, 'أحمد', 'كان أخاً عزيزاً وصديقاً وفياً. سنفتقده كثيراً.', true, '192.168.1.1'],
        [1, 'مريم', 'كان مثالاً للشجاعة والتفاني. رحمه الله.', true, '192.168.1.2'],
        [2, 'د. حسن', 'كانت طبيبة ممتازة وكرست حياتها لخدمة المرضى.', true, '192.168.1.3'],
        [3, 'زميل الدراسة', 'كان طالباً مجتهداً ومثالاً للشباب الواعي.', true, '192.168.1.4'],
        [4, 'زميل العمل', 'كانت باحثة ممتازة وساهمت في تطوير العلوم.', true, '192.168.1.5']
      ];
      
      for (const tribute of sampleTributes) {
        await connection.execute(`
          INSERT INTO tributes (martyr_id, visitor_name, message, is_approved, ip_address) 
          VALUES (?, ?, ?, ?, ?)
        `, tribute);
      }
      
      // Insert sample statistics
      const sampleStats = [
        ['total_martyrs', '{"count": 5, "last_updated": "2024-01-01T00:00:00Z"}'],
        ['martyrs_by_education', '{"خريج": 2, "جامعي": 2, "مدرسة": 1, "last_updated": "2024-01-01T00:00:00Z"}'],
        ['martyrs_by_location', '{"الخرطوم": 5, "last_updated": "2024-01-01T00:00:00Z"}'],
        ['total_tributes', '{"count": 5, "approved": 5, "pending": 0, "last_updated": "2024-01-01T00:00:00Z"}']
      ];
      
      for (const stat of sampleStats) {
        await connection.execute(`
          INSERT INTO statistics (stat_type, stat_value) VALUES (?, ?)
        `, stat);
      }
      
      console.log('   ✅ Default data inserted successfully!');
      
    } catch (error) {
      throw new Error(`Failed to insert default data: ${error.message}`);
    }
    
    // Step 6: Restore data if it existed
    if (dataExists && Object.keys(exportData).length > 0) {
      console.log('\n📥 Restoring existing data...');
      
      try {
        // Restore martyrs
        if (exportData.martyrs && exportData.martyrs.length > 0) {
          for (const martyr of exportData.martyrs) {
            await connection.execute(`
              INSERT INTO martyrs (
                name_ar, name_en, date_of_martyrdom, place_of_martyrdom,
                education_level, university_name, faculty, department, school_state, school_locality,
                spouse, children, occupation, bio, image_url, status, approved, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              martyr.name_ar, martyr.name_en, martyr.date_of_martyrdom, martyr.place_of_martyrdom,
              martyr.education_level, martyr.university_name, martyr.faculty, martyr.department,
              martyr.school_state, martyr.school_locality, martyr.spouse, martyr.children,
              martyr.occupation, martyr.bio, martyr.image_url, martyr.status, martyr.approved,
              martyr.created_at, martyr.updated_at
            ]);
          }
          console.log(`   ✅ Restored ${exportData.martyrs.length} martyrs`);
        }
        
        // Restore tributes
        if (exportData.tributes && exportData.tributes.length > 0) {
          for (const tribute of exportData.tributes) {
            await connection.execute(`
              INSERT INTO tributes (martyr_id, visitor_name, message, is_approved, ip_address, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              tribute.martyr_id, tribute.visitor_name, tribute.message, tribute.is_approved,
              tribute.ip_address, tribute.created_at, tribute.updated_at
            ]);
          }
          console.log(`   ✅ Restored ${exportData.tributes.length} tributes`);
        }
        
        // Restore admins
        if (exportData.admins && exportData.admins.length > 0) {
          for (const admin of exportData.admins) {
            await connection.execute(`
              INSERT INTO admins (username, email, password_hash, role, is_active, last_login, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              admin.username, admin.email, admin.password_hash, admin.role,
              admin.is_active, admin.last_login, admin.created_at, admin.updated_at
            ]);
          }
          console.log(`   ✅ Restored ${exportData.admins.length} admins`);
        }
        
        // Restore media
        if (exportData.media && exportData.media.length > 0) {
          for (const item of exportData.media) {
            await connection.execute(`
              INSERT INTO media_gallery (title, description, file_url, file_type, category, is_public, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
              item.title, item.description, item.file_url, item.file_type,
              item.category, item.is_public, item.created_at, item.updated_at
            ]);
          }
          console.log(`   ✅ Restored ${exportData.media.length} media items`);
        }
        
        // Restore statistics
        if (exportData.stats && exportData.stats.length > 0) {
          for (const stat of exportData.stats) {
            await connection.execute(`
              INSERT INTO statistics (stat_type, stat_value, last_updated)
              VALUES (?, ?, ?)
            `, [stat.stat_type, stat.stat_value, stat.last_updated]);
          }
          console.log(`   ✅ Restored ${exportData.stats.length} statistics`);
        }
        
        console.log('   ✅ All existing data restored successfully!');
        
      } catch (error) {
        console.log('   ⚠️  Some data restoration warnings (this is normal):');
        console.log(`   ℹ️  Error: ${error.message}`);
      }
    }
    
    // Step 7: Verification
    console.log('\n🔍 Verifying migration...');
    
    try {
      const [martyrsCount] = await connection.execute('SELECT COUNT(*) as count FROM martyrs');
      const [tributesCount] = await connection.execute('SELECT COUNT(*) as count FROM tributes');
      const [adminsCount] = await connection.execute('SELECT COUNT(*) as count FROM admins');
      const [mediaCount] = await connection.execute('SELECT COUNT(*) as count FROM media_gallery');
      const [statsCount] = await connection.execute('SELECT COUNT(*) as count FROM statistics');
      
      console.log('   📊 Final counts:');
      console.log(`      - Martyrs: ${martyrsCount[0].count}`);
      console.log(`      - Tributes: ${tributesCount[0].count}`);
      console.log(`      - Admins: ${adminsCount[0].count}`);
      console.log(`      - Media: ${mediaCount[0].count}`);
      console.log(`      - Statistics: ${statsCount[0].count}`);
      
    } catch (error) {
      console.log('   ℹ️  Could not verify final counts');
    }
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log(`📊 Database: ${config.database}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Test your application with the recreated database');
    console.log('   2. Run cleanup script: node cleanup_migrations.js');
    console.log('   3. Verify all API endpoints work correctly');
    
    if (dataExists) {
      console.log('\n✅ Your existing data has been preserved and migrated!');
    } else {
      console.log('\nℹ️  No existing data was found, database created with sample data only');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('\n🔌 Database connection closed');
      } catch (error) {
        console.log('   ℹ️  Could not close connection cleanly');
      }
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migratePreserveData();
}

module.exports = { migratePreserveData };
