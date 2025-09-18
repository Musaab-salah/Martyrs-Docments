-- Migration: Add facebook_link column to martyrs table
-- Date: 2025-09-17
-- Description: Add optional Facebook profile/page link field to martyrs

USE martyrs_archive;

-- Add facebook_link column to martyrs table
ALTER TABLE martyrs
ADD COLUMN facebook_link VARCHAR(500) NULL COMMENT 'Facebook profile or page URL'
AFTER image_url;

-- Display migration completion
SELECT 'Facebook link column added successfully!' as status;