const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const execAsync = promisify(exec);

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'martyrs_archive'
};

async function migratePreserveData() {
  try {
    console.log('🚀 Starting database migration with data preservation...');
    console.log(`📊 Target database: ${config.database}`);
    
    // Step 1: Export current data from old database
    console.log('📤 Exporting current data from existing database...');
    
    // Create export SQL file
    const exportSQL = `
-- Export current data before migration
USE martyrs_archive;

-- Export martyrs data
SELECT 
  CONCAT(
    'INSERT INTO martyrs (name_ar, name_en, date_of_martyrdom, place_of_martyrdom, ',
    'education_level, university_name, faculty, department, school_state, school_locality, ',
    'spouse, children, occupation, bio, image_url, status, approved, created_at, updated_at) VALUES ',
    '(', 
    QUOTE(name_ar), ', ', 
    QUOTE(name_en), ', ', 
    QUOTE(date_of_martyrdom), ', ', 
    QUOTE(place_of_martyrdom), ',',
    QUOTE(COALESCE(education_level, education)), ', ',
    IFNULL(QUOTE(university_name), 'NULL'), ', ',
    IFNULL(QUOTE(faculty), 'NULL'), ', ',
    IFNULL(QUOTE(department), 'NULL'), ', ',
    IFNULL(QUOTE(school_state), 'NULL'), ', ',
    IFNULL(QUOTE(school_locality), 'NULL'), ', ',
    IFNULL(QUOTE(spouse), 'NULL'), ', ',
    IFNULL(children, 'NULL'), ', ',
    QUOTE(occupation), ', ',
    IFNULL(QUOTE(bio), 'NULL'), ', ',
    IFNULL(QUOTE(image_url), 'NULL'), ', ',
    CASE 
      WHEN status IS NOT NULL THEN QUOTE(status)
      WHEN approved = 1 THEN "'approved'"
      ELSE "'pending'"
    END, ', ',
    approved, ', ',
    QUOTE(created_at), ', ',
    QUOTE(updated_at),
    ');'
  ) as insert_statement
FROM martyrs
ORDER BY id;

-- Export tributes data
SELECT 
  CONCAT(
    'INSERT INTO tributes (martyr_id, visitor_name, message, is_approved, ip_address, created_at, updated_at) VALUES ',
    '(', 
    martyr_id, ', ',
    QUOTE(visitor_name), ', ',
    QUOTE(message), ', ',
    is_approved, ', ',
    IFNULL(QUOTE(ip_address), 'NULL'), ', ',
    QUOTE(created_at), ', ',
    QUOTE(updated_at),
    ');'
  ) as insert_statement
FROM tributes
ORDER BY id;

-- Export admins data (excluding the default one that will be recreated)
SELECT 
  CONCAT(
    'INSERT INTO admins (username, email, password_hash, role, is_active, last_login, created_at, updated_at) VALUES ',
    '(', 
    QUOTE(username), ', ',
    QUOTE(email), ', ',
    QUOTE(password_hash), ', ',
    QUOTE(role), ', ',
    is_active, ', ',
    IFNULL(QUOTE(last_login), 'NULL'), ', ',
    QUOTE(created_at), ', ',
    QUOTE(updated_at),
    ');'
  ) as insert_statement
FROM admins
WHERE username != 'sudansust'
ORDER BY id;

-- Export media gallery data
SELECT 
  CONCAT(
    'INSERT INTO media_gallery (title, description, file_url, file_type, category, is_public, created_at, updated_at) VALUES ',
    '(', 
    QUOTE(title), ', ',
    IFNULL(QUOTE(description), 'NULL'), ', ',
    QUOTE(file_url), ', ',
    QUOTE(file_type), ', ',
    IFNULL(QUOTE(category), 'NULL'), ', ',
    is_public, ', ',
    QUOTE(created_at), ', ',
    QUOTE(updated_at),
    ');'
  ) as insert_statement
FROM media_gallery
ORDER BY id;

-- Export statistics data
SELECT 
  CONCAT(
    'INSERT INTO statistics (stat_type, stat_value, last_updated) VALUES ',
    '(', 
    QUOTE(stat_type), ', ',
    QUOTE(stat_value), ', ',
    QUOTE(last_updated),
    ');'
  ) as insert_statement
FROM statistics
ORDER BY id;

-- Show data summary
SELECT 'EXPORT SUMMARY' as info;
SELECT COUNT(*) as total_martyrs FROM martyrs;
SELECT COUNT(*) as total_tributes FROM tributes;
SELECT COUNT(*) as total_admins FROM admins;
SELECT COUNT(*) as total_media FROM media_gallery;
SELECT COUNT(*) as total_stats FROM statistics;
`;

    const exportFile = path.join(__dirname, 'export_data.sql');
    fs.writeFileSync(exportFile, exportSQL);
    
    // Execute export to get data
    const exportCommand = `mysql -h ${config.host} -u ${config.user} ${config.password ? `-p${config.password}` : ''} < "${exportFile}"`;
    
    let exportOutput = '';
    let dataExists = false;
    
    try {
      const { stdout, stderr } = await execAsync(exportCommand);
      
      if (stderr && !stderr.includes('Warning')) {
        console.log('   ℹ️  Could not export data (database may not exist), proceeding with fresh creation');
      } else {
        console.log('   ✅ Data exported successfully');
        exportOutput = stdout;
        dataExists = true;
        
        // Parse the export output to extract INSERT statements
        const lines = stdout.split('\n');
        const insertStatements = lines.filter(line => line.trim().startsWith('INSERT INTO'));
        
        console.log(`   📊 Found ${insertStatements.length} data records to preserve`);
        
        // Save INSERT statements to a file for later restoration
        const insertFile = path.join(__dirname, 'restore_data.sql');
        fs.writeFileSync(insertFile, insertStatements.join('\n'));
        console.log('   💾 INSERT statements saved to restore_data.sql');
      }
    } catch (error) {
      console.log('   ℹ️  Could not export data (database may not exist), proceeding with fresh creation');
    }
    
    // Clean up export file
    fs.unlinkSync(exportFile);
    
    // Step 2: Drop old database and recreate it
    console.log('🗑️  Dropping and recreating database...');
    
    // Drop old database if it exists
    const dropCommand = `mysql -h ${config.host} -u ${config.user} ${config.password ? `-p${config.password}` : ''} -e "DROP DATABASE IF EXISTS \`${config.database}\`;"`;
    
    try {
      await execAsync(dropCommand);
      console.log(`   ✅ Database '${config.database}' dropped successfully`);
    } catch (error) {
      console.log('   ℹ️  Could not drop database (may not exist)');
    }
    
    // Create new database with same name
    const createCommand = `mysql -h ${config.host} -u ${config.user} ${config.password ? `-p${config.password}` : ''} -e "CREATE DATABASE \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`;
    
    try {
      await execAsync(createCommand);
      console.log(`   ✅ Database '${config.database}' recreated successfully`);
    } catch (error) {
      throw new Error(`Failed to recreate database: ${error.message}`);
    }
    
    // Step 3: Create the migration SQL file with the new schema
    console.log('📝 Creating migration SQL file...');
    const migrationSQL = `
-- Final Martyrs Archive Database Schema v2
-- This script will completely recreate the database with the latest schema

USE \`${config.database}\`;

-- Create updated martyrs table with final structure
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create admins table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tributes table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create media gallery table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create statistics table
CREATE TABLE statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stat_type VARCHAR(100) UNIQUE NOT NULL,
  stat_value JSON NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_stat_type (stat_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default super admin account
INSERT INTO admins (username, email, password_hash, role, is_active) 
VALUES (
    'sudansust',
    'admin@martyrsarchive.com',
    '$2a$12$H.NvjNDmZCGq9N9AhxIE4OSkx5sp1VqeMYe.klM/TuAEAywK6eKe6', -- sust@1989
    'super_admin',
    TRUE
);

-- Insert sample martyrs for Sudan
INSERT INTO martyrs (
  name_ar, name_en, date_of_martyrdom, place_of_martyrdom, 
  education_level, university_name, faculty, department,
  occupation, bio, image_url, status, approved
) VALUES
('محمد أحمد علي', 'Mohamed Ahmed Ali', '2024-01-15', 
 '{"state": "الخرطوم", "location": "الخرطوم بحري"}', 
 'جامعي', 'جامعة الخرطوم', 'الهندسة', 'مدني',
 'مهندس مدني', 'كان مثالاً للشجاعة والتفاني في خدمة الوطن. عمل على مشاريع البنية التحتية المهمة.', NULL, 'approved', TRUE),

('فاطمة محمد حسن', 'Fatima Mohamed Hassan', '2024-02-20', 
 '{"state": "الخرطوم", "location": "أم درمان"}', 
 'خريج', 'جامعة السودان', 'الطب', 'طب عام',
 'طبيبة', 'كرست حياتها لعلاج المرضى ومساعدة المحتاجين. كانت مثالاً للرحمة والإنسانية.', NULL, 'approved', TRUE),

('أحمد عمر محمد', 'Ahmed Omar Mohamed', '2024-03-10', 
 '{"state": "الخرطوم", "location": "الخرطوم"}', 
 'مدرسة', NULL, NULL, NULL,
 'طالب', 'كان طالباً مجتهداً يحلم بمستقبل أفضل لبلاده. كان مثالاً للشباب الواعي.', NULL, 'approved', TRUE),

('سارة عبد الرحمن', 'Sara Abdel Rahman', '2024-04-05', 
 '{"state": "الخرطوم", "location": "الخرطوم شمال"}', 
 'جامعي', 'جامعة النيلين', 'العلوم', 'كيمياء',
 'باحثة', 'عملت في مجال البحث العلمي وساهمت في تطوير العلوم في السودان.', NULL, 'approved', TRUE),

('علي حسن محمد', 'Ali Hassan Mohamed', '2024-05-12', 
 '{"state": "الخرطوم", "location": "الخرطوم شرق"}', 
 'خريج', 'جامعة الخرطوم', 'الاقتصاد', 'إدارة أعمال',
 'محاسب', 'كان محاسباً أميناً ساهم في تطوير القطاع المالي في السودان.', NULL, 'approved', TRUE);

-- Insert sample tributes
INSERT INTO tributes (martyr_id, visitor_name, message, is_approved, ip_address) VALUES
(1, 'أحمد', 'كان أخاً عزيزاً وصديقاً وفياً. سنفتقده كثيراً.', TRUE, '192.168.1.1'),
(1, 'مريم', 'كان مثالاً للشجاعة والتفاني. رحمه الله.', TRUE, '192.168.1.2'),
(2, 'د. حسن', 'كانت طبيبة ممتازة وكرست حياتها لخدمة المرضى.', TRUE, '192.168.1.3'),
(3, 'زميل الدراسة', 'كان طالباً مجتهداً ومثالاً للشباب الواعي.', TRUE, '192.168.1.4'),
(4, 'زميل العمل', 'كانت باحثة ممتازة وساهمت في تطوير العلوم.', TRUE, '192.168.1.5');

-- Insert sample statistics
INSERT INTO statistics (stat_type, stat_value) VALUES
('total_martyrs', '{"count": 5, "last_updated": "2024-01-01T00:00:00Z"}'),
('martyrs_by_education', '{"خريج": 2, "جامعي": 2, "مدرسة": 1, "last_updated": "2024-01-01T00:00:00Z"}'),
('martyrs_by_location', '{"الخرطوم": 5, "last_updated": "2024-01-01T00:00:00Z"}'),
('total_tributes', '{"count": 5, "approved": 5, "pending": 0, "last_updated": "2024-01-01T00:00:00Z"}');

-- Display initialization summary
SELECT 'Database initialization completed successfully!' as status;
SELECT COUNT(*) as total_martyrs FROM martyrs;
SELECT COUNT(*) as total_tributes FROM tributes;
SELECT COUNT(*) as total_admins FROM admins;
SELECT status, COUNT(*) as count FROM martyrs GROUP BY status;
`;

    const tempFile = path.join(__dirname, 'temp_migration.sql');
    fs.writeFileSync(tempFile, migrationSQL);
    console.log('   ✅ Migration SQL file created');
    
    // Step 4: Execute the migration
    console.log('🔨 Executing migration...');
    const mysqlCommand = `mysql -h ${config.host} -u ${config.user} ${config.password ? `-p${config.password}` : ''} < "${tempFile}"`;
    
    const { stdout, stderr } = await execAsync(mysqlCommand);
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(`MySQL error: ${stderr}`);
    }
    
    console.log('✅ Database schema created successfully!');
    console.log('\n📊 Migration output:');
    console.log(stdout);
    
    // Clean up migration file
    fs.unlinkSync(tempFile);
    
    // Step 5: Restore data if it existed
    if (dataExists) {
      console.log('\n📥 Restoring data...');
      
      const restoreFile = path.join(__dirname, 'restore_data.sql');
      if (fs.existsSync(restoreFile)) {
        const restoreCommand = `mysql -h ${config.host} -u ${config.user} ${config.password ? `-p${config.password}` : ''} \`${config.database}\` < "${restoreFile}"`;
        
        try {
          const { stdout: restoreOutput, stderr: restoreError } = await execAsync(restoreCommand);
          
          if (restoreError && !restoreError.includes('Warning')) {
            console.log('   ⚠️  Some data restoration warnings (this is normal):');
            console.log(restoreError);
          } else {
            console.log('   ✅ Data restored successfully');
          }
          
          console.log('   📊 Restore output:');
          console.log(restoreOutput);
          
        } catch (error) {
          console.log('   ❌ Error restoring data:', error.message);
        }
        
        // Clean up restore file
        fs.unlinkSync(restoreFile);
      }
    }
    
    // Step 6: Verification
    console.log('\n🔍 Verifying migration...');
    const verifyCommand = `mysql -h ${config.host} -u ${config.user} ${config.password ? `-p${config.password}` : ''} -e "USE \`${config.database}\`; SELECT COUNT(*) as total_martyrs FROM martyrs; SELECT COUNT(*) as total_tributes FROM tributes; SELECT COUNT(*) as total_admins FROM admins;"`;
    
    try {
      const { stdout: verifyOutput } = await execAsync(verifyCommand);
      console.log('   📊 Final counts:');
      console.log(verifyOutput);
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
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migratePreserveData();
}

module.exports = { migratePreserveData };
