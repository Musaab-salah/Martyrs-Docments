-- Migration: Add videos table
-- This migration adds the videos table for the video management system

CREATE TABLE IF NOT EXISTS videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  youtubeLink VARCHAR(500) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_title (title),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample data for testing
INSERT IGNORE INTO videos (title, youtubeLink) VALUES
('فيديو تجريبي', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
('مقطع توثيقي', 'https://www.youtube.com/watch?v=9bZkp7q19f0');
