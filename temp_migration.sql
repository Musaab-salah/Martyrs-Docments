
-- Final Martyrs Archive Database Schema
-- This script will completely recreate the database

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
