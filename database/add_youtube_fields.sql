-- Migration to add YouTube playlist fields to martyrs table
-- Run this script to add the new YouTube functionality

USE martyrs_archive;

-- Add YouTube playlist fields to the martyrs table
ALTER TABLE martyrs 
ADD COLUMN youtube_playlist VARCHAR(500) NULL COMMENT 'YouTube playlist URL',
ADD COLUMN youtube_display_type ENUM('link', 'embed') DEFAULT 'link' COMMENT 'How to display the YouTube playlist';

-- Add indexes for performance
CREATE INDEX idx_youtube_playlist ON martyrs(youtube_playlist);
CREATE INDEX idx_youtube_display_type ON martyrs(youtube_display_type);

-- Show the updated table structure
DESCRIBE martyrs;
