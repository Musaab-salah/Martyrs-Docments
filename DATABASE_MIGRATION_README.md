# Database Migration Guide

This guide explains how to migrate your existing Martyrs Archive database to the new, clean schema.

## Overview

The migration process will:
1. **Export** current data from the existing database
2. **Drop** the old database completely
3. **Recreate** the database with the new, clean schema
4. **Import** the current data back
5. **Clean up** old migration files

## What's New in the Schema

### ✅ Improvements
- **Consistent Status Field**: Uses `status` ENUM('pending', 'approved', 'rejected') instead of just `approved` boolean
- **Removed Inconsistencies**: Eliminated `longitude` and `latitude` fields that were causing issues
- **Better Indexing**: Added performance indexes for common queries
- **Cleaner Structure**: Removed complex fallback logic and column checking

### 🔄 Backward Compatibility
- The `approved` boolean field is kept for backward compatibility
- Both `status` and `approved` fields are updated together for consistency

## Migration Files

### 1. `final_schema.sql`
- **Purpose**: The final, clean database schema
- **Use**: Reference for understanding the new structure
- **Do NOT run directly**: This is for reference only

### 2. `migrate_preserve_data.js` (RECOMMENDED)
- **Purpose**: Node.js script that automatically preserves ALL existing data
- **Use**: **Safest migration with data preservation**
- **Requirements**: Node.js, MySQL command line client, and dotenv package
- **Advantage**: Automatically exports, migrates, and restores your data

## Migration Process

### Automated Migration with Data Preservation (Recommended)

1. **Install dependencies**:
   ```bash
   npm install dotenv
   ```

2. **Ensure MySQL command line client is available**:
   - Windows: Install MySQL and add to PATH
   - Linux/Mac: `sudo apt-get install mysql-client` or `brew install mysql`

3. **Set up environment variables** in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=martyrs_archive
   ```

4. **Run the data-preserving migration script**:
   ```bash
   node migrate_preserve_data.js
   ```

### Manual Migration

1. **Export current data**:
   ```bash
   mysql -u root -p martyrs_archive -e "SELECT * FROM martyrs;" > martyrs_backup.sql
   mysql -u root -p martyrs_archive -e "SELECT * FROM tributes;" > tributes_backup.sql
   mysql -u root -p martyrs_archive -e "SELECT * FROM admins;" > admins_backup.sql
   ```

2. **Drop and recreate database**:
   ```bash
   mysql -u root -p -e "DROP DATABASE IF EXISTS martyrs_archive; CREATE DATABASE martyrs_archive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

3. **Apply the new schema**:
   ```bash
   mysql -u root -p martyrs_archive < final_schema.sql
   ```

4. **Restore your data** (if any):
   ```bash
   mysql -u root -p martyrs_archive < martyrs_backup.sql
   mysql -u root -p martyrs_archive < tributes_backup.sql
   mysql -u root -p martyrs_archive < admins_backup.sql
   ```

## ⚠️ IMPORTANT: Data Preservation

### The Problem
Previous migration approaches only created sample data and **did NOT preserve your existing data**. This is why you might see different record counts after migration.

### The Solution
Use `migrate_preserve_data.js` which will:
1. **Export** all your existing data before migration
2. **Recreate** the database with the new schema
3. **Restore** all your data automatically
4. **Verify** the final record counts match the original

## What Happens During Migration

### With Data Preservation Script:
1. **Data Export**: Current data is exported and saved to temporary files
2. **Database Drop**: Old database is completely removed
3. **Schema Creation**: New tables are created with proper structure
4. **Data Restoration**: All your existing data is automatically restored
5. **Verification**: Final counts are displayed and should match original counts

## Post-Migration Steps

### 1. Update Application Code
The following files have been updated to use the new schema:
- `server/routes/martyrs.js` - Removed fallback logic, uses `status` field consistently
- `server/routes/stats.js` - Updated queries to use new schema
- `server/routes/tributes.js` - Uses `status` field for martyr verification

### 2. Remove Old Migration Files
Delete these files as they're no longer needed:
- `database/migration_add_status_field.sql`
- `database/migration_add_approved.sql`
- `database/migration_remove_coordinates_requirement.sql`

### 3. Test Your Application
- Verify all API endpoints work correctly
- Check that martyrs display properly
- Ensure admin functions work as expected
- **Verify record counts match your expectations**

## Schema Changes Summary

| Old Field | New Field | Change |
|-----------|-----------|---------|
| `approved` (boolean) | `status` (ENUM) + `approved` (boolean) | Added status field, kept approved for compatibility |
| `longitude`, `latitude` | ❌ Removed | These fields are no longer used |
| `education` | `education_level` | Renamed for clarity |
| Various indexes | Optimized indexes | Better performance for common queries |

## Troubleshooting

### Common Issues

1. **Different Record Counts After Migration**:
   ```
   ❌ The number of records after the migration is not the same as the numbers before
   ```
   **Solution**: Use `migrate_preserve_data.js` which automatically preserves all your data.

2. **Connection Errors**: Make sure MySQL is running and credentials are correct
3. **Permission Errors**: Ensure your MySQL user has DROP and CREATE privileges
4. **Data Loss**: Always backup your data before migration

### Getting Help

If you encounter issues:
1. Check the console output for error messages
2. Verify your MySQL connection settings
3. Ensure you have the required permissions
4. **Use `migrate_preserve_data.js` for guaranteed data preservation**

## Sample Data

After migration with data preservation:
- **All your existing martyrs** with proper status mapping
- **All your existing tributes** preserved
- **All your existing admins** (plus the default super admin)
- **All your existing media and statistics**

## Performance Improvements

The new schema includes:
- **Optimized indexes** for common query patterns
- **Proper foreign key constraints** for data integrity
- **JSON field for place_of_martyrdom** for flexible location storage
- **Enum fields** for status and education levels

## Next Steps

After successful migration:
1. **Test thoroughly** - Ensure all functionality works
2. **Update frontend** - If you have any hardcoded field references
3. **Monitor performance** - The new indexes should improve query speed
4. **Backup regularly** - Use the new clean schema for future backups

---

**⚠️ Important**: This migration will completely replace your database. Make sure to backup any important data before proceeding.

**💡 Recommendation**: Use `migrate_preserve_data.js` for the most reliable migration experience with guaranteed data preservation.

**🔍 Data Count Issue**: If you're seeing different record counts after migration, you need to use the data-preserving script to restore your original data.
