# Database Backup System

This directory contains a comprehensive database backup solution for the Martyrs Archive system. The backup system supports both MySQL and provides fallback options for different environments.

## 🚀 Quick Start

### Prerequisites
- Node.js installed (version 14 or higher)
- MySQL database access
- Proper database credentials

### Basic Usage

#### Windows Users
```cmd
# Using Command Prompt
backup_database.bat

# Using PowerShell
.\backup_database.ps1
```

#### Unix/Linux/macOS Users
```bash
# Make script executable (first time only)
chmod +x backup_database.sh

# Run backup
./backup_database.sh
```

#### Direct Node.js Usage
```bash
# Full backup (schema + data)
node backup_database.js

# Schema only
node backup_database.js --schema-only

# Data only
node backup_database.js --data-only

# No compression
node backup_database.js --no-compress

# Custom retention period
node backup_database.js --retention-days 7
```

## 📁 Files Overview

- **`backup_database.js`** - Main backup script (Node.js)
- **`backup_database.bat`** - Windows batch file
- **`backup_database.ps1`** - Windows PowerShell script
- **`backup_database.sh`** - Unix/Linux/macOS shell script

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=martyrs_archive
DB_PORT=3306

# Backup Configuration
BACKUP_PATH=./backups
BACKUP_RETENTION_DAYS=30
```

### Backup Options

| Option | Description | Default |
|--------|-------------|---------|
| `--schema-only` | Backup only table structure | false |
| `--data-only` | Backup only data | false |
| `--no-compress` | Don't compress backup files | false |
| `--retention-days N` | Set retention period in days | 30 |

## 🔧 How It Works

### 1. Primary Method: mysqldump
The script first attempts to use `mysqldump` (MySQL's native backup tool) for optimal performance and reliability.

**Features:**
- Single transaction backups (consistent data)
- Includes routines, triggers, and events
- Proper character set handling
- Fast execution

### 2. Fallback Method: Node.js
If `mysqldump` is not available, the script falls back to a pure Node.js implementation.

**Features:**
- No external dependencies
- Cross-platform compatibility
- Customizable backup content
- Progress reporting

### 3. Backup Structure
```
backups/
├── 2024-01-15T10-30-45-123Z/
│   ├── martyrs_archive_backup.sql
│   ├── martyrs_archive_backup.sql.gz (if compressed)
│   └── backup_info.json
├── 2024-01-14T09-15-30-456Z/
│   └── ...
└── ...
```

### 4. Automatic Cleanup
- Removes backups older than the retention period
- Configurable via `BACKUP_RETENTION_DAYS`
- Prevents disk space issues

## 📊 Backup Content

### Schema Backup
- Table creation statements
- Indexes and constraints
- Character set and collation settings
- Engine specifications

### Data Backup
- All table data as INSERT statements
- Proper escaping for special characters
- JSON field handling
- NULL value preservation

### Metadata
- Backup timestamp
- Database information
- File size and compression status
- Configuration used

## 🛡️ Security Features

- **No password exposure**: Passwords are not logged
- **Secure connections**: Uses MySQL's secure connection options
- **File permissions**: Backup files are created with appropriate permissions
- **Cleanup**: Automatic removal of old backups

## 🔍 Troubleshooting

### Common Issues

#### 1. "mysqldump not found"
**Solution:** Install MySQL client tools or use the Node.js fallback
```bash
# Ubuntu/Debian
sudo apt-get install mysql-client

# CentOS/RHEL
sudo yum install mysql

# macOS
brew install mysql-client
```

#### 2. "Access denied" errors
**Solution:** Check database credentials and permissions
```sql
-- Verify user permissions
SHOW GRANTS FOR 'your_user'@'your_host';

-- Grant backup permissions if needed
GRANT SELECT, SHOW VIEW, LOCK TABLES ON martyrs_archive.* TO 'your_user'@'your_host';
```

#### 3. "Connection refused"
**Solution:** Verify database host and port
```bash
# Test connection
mysql -h your_host -P your_port -u your_user -p
```

#### 4. Insufficient disk space
**Solution:** Check available space and adjust retention
```bash
# Check disk usage
df -h

# Reduce retention period
node backup_database.js --retention-days 7
```

### Debug Mode
Enable verbose logging by setting the environment variable:
```bash
DEBUG=1 node backup_database.js
```

## 📈 Performance Tips

### For Large Databases
1. **Use mysqldump**: Significantly faster than Node.js fallback
2. **Schedule during off-peak hours**: Reduce impact on production
3. **Monitor disk I/O**: Ensure backup storage can handle write load
4. **Consider incremental backups**: For very large databases

### For Small Databases
1. **Node.js fallback is fine**: No performance concerns
2. **Enable compression**: Save disk space
3. **Frequent backups**: Low overhead allows more frequent backups

## 🔄 Automation

### Cron Jobs (Linux/macOS)
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/your/project/backup_database.sh

# Weekly full backup
0 2 * * 0 /path/to/your/project/backup_database.sh --retention-days 7
```

### Windows Task Scheduler
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily at 2 AM)
4. Action: Start a program
5. Program: `cmd.exe`
6. Arguments: `/c "cd /d C:\path\to\your\project && backup_database.bat"`

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Database Backup
  run: |
    node backup_database.js --retention-days 7
  env:
    DB_HOST: ${{ secrets.DB_HOST }}
    DB_USER: ${{ secrets.DB_USER }}
    DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
    DB_NAME: ${{ secrets.DB_NAME }}
```

## 📋 Restore Process

### From mysqldump backup
```bash
mysql -u username -p database_name < backup_file.sql
```

### From Node.js backup
```bash
mysql -u username -p database_name < backup_file.sql
```

### Partial Restore
```bash
# Restore specific table
mysql -u username -p database_name < table_backup.sql
```

## 🆘 Support

If you encounter issues:

1. **Check logs**: Look for error messages in the console output
2. **Verify configuration**: Ensure `.env` file is correct
3. **Test connection**: Try connecting to the database manually
4. **Check permissions**: Verify database user has necessary privileges
5. **Review this README**: Many common issues are covered here

## 📝 Changelog

### Version 1.0.0
- Initial release
- mysqldump and Node.js fallback support
- Automatic cleanup and compression
- Cross-platform script support
- Comprehensive error handling

---

**Note:** Always test your backup and restore procedures in a safe environment before relying on them in production.
