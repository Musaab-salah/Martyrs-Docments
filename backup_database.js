#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Load environment variables
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'martyrs_archive',
  port: process.env.DB_PORT || 3306
};

// Backup configuration
const backupConfig = {
  backupPath: process.env.BACKUP_PATH || './backups',
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
  compressBackups: true,
  includeSchema: true,
  includeData: true
};

class DatabaseBackup {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = path.join(backupConfig.backupPath, this.timestamp);
  }

  async createBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log(`✅ Created backup directory: ${this.backupDir}`);
    } catch (error) {
      throw new Error(`Failed to create backup directory: ${error.message}`);
    }
  }

  async checkMysqldump() {
    try {
      await execAsync('mysqldump --version');
      return true;
    } catch (error) {
      return false;
    }
  }

  async backupWithMysqldump() {
    const { host, user, password, database, port } = dbConfig;
    
    let mysqldumpCommand = 'mysqldump';
    
    // Add connection options
    if (host && host !== 'localhost') {
      mysqldumpCommand += ` -h ${host}`;
    }
    if (port && port !== 3306) {
      mysqldumpCommand += ` -P ${port}`;
    }
    if (user) {
      mysqldumpCommand += ` -u ${user}`;
    }
    if (password) {
      mysqldumpCommand += ` -p${password}`;
    }

    // Add database options
    mysqldumpCommand += ` --single-transaction --routines --triggers --events`;
    mysqldumpCommand += ` --add-drop-database --add-drop-table`;
    mysqldumpCommand += ` --default-character-set=utf8mb4`;
    
    // Add output file
    const outputFile = path.join(this.backupDir, `${database}_backup.sql`);
    mysqldumpCommand += ` ${database} > "${outputFile}"`;

    console.log('🔄 Creating backup with mysqldump...');
    
    try {
      await execAsync(mysqldumpCommand);
      console.log(`✅ Backup created successfully: ${outputFile}`);
      
      if (backupConfig.compressBackups) {
        await this.compressFile(outputFile);
      }
      
      return outputFile;
    } catch (error) {
      throw new Error(`mysqldump failed: ${error.message}`);
    }
  }

  async backupWithNodeJS() {
    console.log('🔄 Creating backup with Node.js...');
    
    try {
      const connection = await mysql.createConnection(dbConfig);
      
      // Get all tables
      const [tables] = await connection.execute('SHOW TABLES');
      
      let backupContent = '';
      
      // Add header
      backupContent += `-- Database Backup for ${dbConfig.database}\n`;
      backupContent += `-- Created: ${new Date().toISOString()}\n`;
      backupContent += `-- Server: ${dbConfig.host}:${dbConfig.port}\n\n`;
      
      // Backup each table
      for (const tableRow of tables) {
        const tableName = Object.values(tableRow)[0];
        console.log(`📋 Backing up table: ${tableName}`);
        
        if (backupConfig.includeSchema) {
          backupContent += await this.getTableSchema(connection, tableName);
        }
        
        if (backupConfig.includeData) {
          backupContent += await this.getTableData(connection, tableName);
        }
        
        backupContent += '\n';
      }
      
      await connection.end();
      
      // Write backup file
      const outputFile = path.join(this.backupDir, `${dbConfig.database}_backup.sql`);
      await fs.writeFile(outputFile, backupContent, 'utf8');
      
      console.log(`✅ Backup created successfully: ${outputFile}`);
      
      if (backupConfig.compressBackups) {
        await this.compressFile(outputFile);
      }
      
      return outputFile;
    } catch (error) {
      throw new Error(`Node.js backup failed: ${error.message}`);
    }
  }

  async getTableSchema(connection, tableName) {
    const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
    const createStatement = createTable[0]['Create Table'];
    
    return `-- Table structure for table \`${tableName}\`\n`;
    return `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    return `${createStatement};\n\n`;
  }

  async getTableData(connection, tableName) {
    const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
    
    if (rows.length === 0) {
      return `-- No data for table \`${tableName}\`\n`;
    }
    
    let dataContent = `-- Data for table \`${tableName}\`\n`;
    
    // Get column names
    const [columns] = await connection.execute(`SHOW COLUMNS FROM \`${tableName}\``);
    const columnNames = columns.map(col => col.Field);
    
    // Insert statements
    for (const row of rows) {
      const values = columnNames.map(col => {
        const value = row[col];
        if (value === null) return 'NULL';
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        return value;
      });
      
      dataContent += `INSERT INTO \`${tableName}\` (\`${columnNames.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
    }
    
    return dataContent;
  }

  async compressFile(filePath) {
    try {
      const compressedPath = `${filePath}.gz`;
      await execAsync(`gzip "${filePath}"`);
      console.log(`✅ File compressed: ${compressedPath}`);
      return compressedPath;
    } catch (error) {
      console.warn(`⚠️  Compression failed: ${error.message}`);
      return filePath;
    }
  }

  async cleanupOldBackups() {
    try {
      const backupRoot = path.resolve(backupConfig.backupPath);
      const entries = await fs.readdir(backupRoot, { withFileTypes: true });
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - backupConfig.retentionDays);
      
      let deletedCount = 0;
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const entryPath = path.join(backupRoot, entry.name);
          const stats = await fs.stat(entryPath);
          
          if (stats.mtime < cutoffDate) {
            await fs.rm(entryPath, { recursive: true, force: true });
            console.log(`🗑️  Deleted old backup: ${entry.name}`);
            deletedCount++;
          }
        }
      }
      
      if (deletedCount > 0) {
        console.log(`✅ Cleaned up ${deletedCount} old backup(s)`);
      } else {
        console.log('✅ No old backups to clean up');
      }
    } catch (error) {
      console.warn(`⚠️  Cleanup failed: ${error.message}`);
    }
  }

  async createBackup() {
    try {
      console.log('🚀 Starting database backup...');
      console.log(`📊 Database: ${dbConfig.database}`);
      console.log(`📁 Backup location: ${this.backupDir}`);
      
      // Create backup directory
      await this.createBackupDirectory();
      
      // Try mysqldump first, fallback to Node.js
      let backupFile;
      if (await this.checkMysqldump()) {
        backupFile = await this.backupWithMysqldump();
      } else {
        console.log('⚠️  mysqldump not available, using Node.js fallback');
        backupFile = await this.backupWithNodeJS();
      }
      
      // Cleanup old backups
      await this.cleanupOldBackups();
      
      // Create backup info file
      const infoFile = path.join(this.backupDir, 'backup_info.json');
      const backupInfo = {
        database: dbConfig.database,
        timestamp: this.timestamp,
        backupFile: path.basename(backupFile),
        fileSize: (await fs.stat(backupFile)).size,
        config: backupConfig
      };
      
      await fs.writeFile(infoFile, JSON.stringify(backupInfo, null, 2));
      
      console.log('\n🎉 Backup completed successfully!');
      console.log(`📁 Backup location: ${this.backupDir}`);
      console.log(`📄 Backup file: ${path.basename(backupFile)}`);
      console.log(`📊 File size: ${(backupInfo.fileSize / 1024 / 1024).toFixed(2)} MB`);
      
      return backupFile;
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Database Backup Script

Usage: node backup_database.js [options]

Options:
  --help, -h          Show this help message
  --schema-only        Backup only table structure (no data)
  --data-only         Backup only data (no schema)
  --no-compress       Don't compress backup files
  --retention-days N  Set retention period in days (default: 30)

Examples:
  node backup_database.js
  node backup_database.js --schema-only
  node backup_database.js --no-compress
  node backup_database.js --retention-days 7

Environment Variables:
  DB_HOST             Database host (default: localhost)
  DB_USER             Database user (default: root)
  DB_PASSWORD         Database password
  DB_NAME             Database name (default: martyrs_archive)
  DB_PORT             Database port (default: 3306)
  BACKUP_PATH         Backup directory (default: ./backups)
  BACKUP_RETENTION_DAYS Retention period in days (default: 30)
`);
    return;
  }
  
  // Parse command line arguments
  if (args.includes('--schema-only')) {
    backupConfig.includeData = false;
  }
  if (args.includes('--data-only')) {
    backupConfig.includeSchema = false;
  }
  if (args.includes('--no-compress')) {
    backupConfig.compressBackups = false;
  }
  
  const retentionIndex = args.indexOf('--retention-days');
  if (retentionIndex !== -1 && args[retentionIndex + 1]) {
    backupConfig.retentionDays = parseInt(args[retentionIndex + 1]);
  }
  
  try {
    const backup = new DatabaseBackup();
    await backup.createBackup();
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DatabaseBackup;
