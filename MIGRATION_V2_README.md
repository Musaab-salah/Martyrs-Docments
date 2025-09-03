# Database Migration - Complete Database Recreation

## 🎯 Overview

This migration script (`migrate_database.js`) completely recreates the database with the latest schema. It:

1. **Exports existing data** from the old database (if it exists)
2. **Drops the old database** completely
3. **Creates a new database** with a new name (`martyrs_archive_v2`)
4. **Applies the latest schema** with all improvements
5. **Restores existing data** (if any was exported)
6. **Inserts sample data** for testing

## 🚀 Quick Start

### Prerequisites
- MySQL server running
- Node.js installed
- Proper database credentials in `.env` file

### Run Migration
```bash
node migrate_database.js
```

## 📊 What Happens

### Step 1: Data Export
- Connects to existing `martyrs_archive` database
- Exports all data (martyrs, tributes, admins, media, statistics)
- Saves export to temporary file

### Step 2: Database Recreation
- **Drops** the existing `martyrs_archive` database completely
- **Recreates** the `martyrs_archive` database with the same name
- Applies the latest schema with all improvements

### Step 3: Data Restoration
- Restores all exported data to the new database
- Maintains data integrity and relationships

### Step 4: Sample Data
- Inserts sample martyrs, tributes, and statistics
- Provides test data for development

## 🔧 Configuration

### Environment Variables
Your existing `.env` file configuration will work:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=martyrs_archive
DB_PORT=3306
```

### Database Name
- **Database**: `martyrs_archive` (same name, recreated)

## 🛡️ Safety Features

- **Data Preservation**: Exports existing data before deletion
- **Confirmation**: Shows what will be done before execution
- **Error Handling**: Graceful handling of failures
- **Verification**: Confirms successful migration

## 📋 Schema Changes

### New Features
- Improved JSON structure for place_of_martyrdom
- Better indexing for performance
- Enhanced status management
- Sample data for testing

### Tables Created
- `martyrs` - Main martyr records
- `admins` - Admin users
- `tributes` - Visitor tributes
- `media_gallery` - Media files
- `statistics` - System statistics

## 🔍 Verification

After migration, the script will:
- Show final record counts
- Display database status
- Confirm successful completion

## 🆘 Troubleshooting

### Common Issues
1. **Database connection failed**
   - Check `.env` file configuration
   - Verify MySQL server is running

2. **Permission denied**
   - Ensure user has DROP/CREATE privileges
   - Run as root or privileged user

3. **Data not restored**
   - Check export/restore logs
   - Verify old database existed

## 📚 Related Files

- `database/final_schema.sql` - Final schema reference
- `cleanup_migrations.js` - Cleanup old migration files
- `DATABASE_MIGRATION_README.md` - General migration guide

## 🎉 After Migration

1. **Test thoroughly** - verify all functionality works
2. **Run cleanup** - `node cleanup_migrations.js`
3. **Monitor performance** - check for improvements

---

**⚠️ Important**: This migration will completely replace your database. Ensure you have backups if needed!
