-- Migration script to add approved column to existing martyrs table
-- Run this script if you have an existing database without the approved column

USE martyrs_archive;

-- Add approved column to existing martyrs table
ALTER TABLE martyrs 
ADD COLUMN approved BOOLEAN DEFAULT FALSE COMMENT 'Whether the martyr has been approved by admin';

-- Add index for better performance
ALTER TABLE martyrs 
ADD INDEX idx_approved (approved);

-- Set all existing martyrs as approved (assuming they were manually added)
UPDATE martyrs SET approved = TRUE WHERE approved IS NULL;

-- Display migration summary
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as total_martyrs FROM martyrs;
SELECT COUNT(*) as approved_martyrs FROM martyrs WHERE approved = TRUE;
SELECT COUNT(*) as pending_martyrs FROM martyrs WHERE approved = FALSE;


