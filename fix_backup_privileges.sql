-- Fix Backup Privileges Script
-- Run this as root/administrator to grant necessary privileges for mysqldump

-- Replace 'api' with your actual username and 'localhost' with your host if different
-- Replace 'martyrs_archive' with your actual database name

-- Grant necessary privileges for mysqldump backup
GRANT SELECT, SHOW VIEW, LOCK TABLES, PROCESS ON martyrs_archive.* TO 'api'@'localhost';

-- If you want to grant privileges for all databases (be careful with this)
-- GRANT SELECT, SHOW VIEW, LOCK TABLES, PROCESS ON *.* TO 'api'@'localhost';

-- Grant additional privileges that might be needed
GRANT EVENT ON martyrs_archive.* TO 'api'@'localhost';
GRANT TRIGGER ON martyrs_archive.* TO 'api'@'localhost';

-- Reload privileges
FLUSH PRIVILEGES;

-- Verify the privileges were granted
SHOW GRANTS FOR 'api'@'localhost';

-- Alternative: Create a dedicated backup user with minimal privileges
-- CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'secure_backup_password';
-- GRANT SELECT, SHOW VIEW, LOCK TABLES, PROCESS ON martyrs_archive.* TO 'backup_user'@'localhost';
-- FLUSH PRIVILEGES;
