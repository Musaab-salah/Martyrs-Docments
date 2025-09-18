-- Migration: Add google_drive_link field to martyrs table
-- Date: 2025-09-17

USE martyrs_archive;

-- Add the google_drive_link column
ALTER TABLE martyrs
ADD COLUMN google_drive_link VARCHAR(500) NULL COMMENT 'Google Drive file or folder URL'
AFTER facebook_link;

-- Verify the change
DESCRIBE martyrs;