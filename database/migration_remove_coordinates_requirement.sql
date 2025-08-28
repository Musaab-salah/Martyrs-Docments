-- Migration script to completely remove latitude and longitude columns
-- These columns are not required for functionality as the frontend uses fallback state coordinates

-- Remove the coordinates index first (if it exists)
DROP INDEX IF EXISTS idx_coordinates ON martyrs;

-- Remove latitude column
ALTER TABLE martyrs DROP COLUMN IF EXISTS latitude;

-- Remove longitude column
ALTER TABLE martyrs DROP COLUMN IF EXISTS longitude;
