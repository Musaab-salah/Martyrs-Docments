-- Migration script to add status field to martyrs table
-- This will support three states: 'approved', 'rejected', 'pending'
-- Run this script to upgrade existing installations

USE martyrs_archive;

-- Add status field to martyrs table
ALTER TABLE martyrs 
ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' 
COMMENT 'Status of martyr record: pending, approved, or rejected';

-- Add index for better performance
ALTER TABLE martyrs 
ADD INDEX idx_status (status);

-- Migrate existing data: convert approved boolean to status
UPDATE martyrs 
SET status = CASE 
    WHEN approved = TRUE THEN 'approved'
    WHEN approved = FALSE THEN 'pending'
    ELSE 'pending'
END;

-- Display migration summary
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as total_martyrs FROM martyrs;
SELECT status, COUNT(*) as count FROM martyrs GROUP BY status;
SELECT COUNT(*) as approved_martyrs FROM martyrs WHERE status = 'approved';
SELECT COUNT(*) as pending_martyrs FROM martyrs WHERE status = 'pending';
SELECT COUNT(*) as rejected_martyrs FROM martyrs WHERE status = 'rejected';
