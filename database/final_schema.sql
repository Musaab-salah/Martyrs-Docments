-- Final Martyrs Archive Database Schema
-- This schema consolidates all changes and removes inconsistencies
-- Run this script to completely recreate the database with current data

-- Drop and recreate database
DROP DATABASE IF EXISTS martyrs_archive;
CREATE DATABASE martyrs_archive
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE martyrs_archive;

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
