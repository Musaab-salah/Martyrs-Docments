#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const zlib = require('zlib');
const { promisify: utilPromisify } = require('util');

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
  includeData: true,
  skipMysqldump: false,
  skipPrivilegeCheck: false
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
    
    // Build mysqldump command as an array to avoid shell interpretation issues
    const mysqldumpArgs = ['mysqldump'];
    
    // Add connection options
    if (host && host !== 'localhost') {
      mysqldumpArgs.push('-h', host);
    }
    if (port && port !== 3306) {
      mysqldumpArgs.push('-P', port.toString());
    }
    if (user) {
      mysqldumpArgs.push('-u', user);
    }
    if (password) {
      mysqldumpArgs.push('-p' + password);
    }

    // Add database options (with reduced privileges in mind)
    mysqldumpArgs.push(
      '--single-transaction',
      '--routines',
      '--triggers',
      '--events',
      '--add-drop-table',
      '--default-character-set=utf8mb4',
      '--no-tablespaces',  // Skip tablespaces if no PROCESS privilege
      '--skip-lock-tables' // Skip LOCK TABLES if no LOCK TABLES privilege
    );
    
    // Add database name
    mysqldumpArgs.push(database);
    
    // Add output file
    const outputFile = path.join(this.backupDir, `${database}_backup.sql`);
    
    console.log('🔄 Creating backup with mysqldump...');
    console.log(`Command: mysqldump [options] ${database} > ${outputFile}`);
    
    try {
      // Use spawn instead of exec to avoid shell interpretation
      const { spawn } = require('child_process');
      const mysqldump = spawn('mysqldump', mysqldumpArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Create write stream for output file
      const writeStream = fsSync.createWriteStream(outputFile);
      
      // Pipe mysqldump output to file
      mysqldump.stdout.pipe(writeStream);
      
      // Handle errors and output
      let stderrData = '';
      mysqldump.stderr.on('data', (data) => {
        stderrData += data.toString();
        console.warn(`mysqldump stderr: ${data.toString().trim()}`);
      });
      
      // Wait for completion with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          mysqldump.kill();
          writeStream.end();
          reject(new Error('mysqldump timed out after 5 minutes'));
        }, 5 * 60 * 1000); // 5 minutes timeout
        
        mysqldump.on('close', (code) => {
          clearTimeout(timeout);
          writeStream.end();
          if (code === 0) {
            resolve();
          } else {
            const errorMsg = stderrData ? `: ${stderrData.trim()}` : '';
            reject(new Error(`mysqldump exited with code ${code}${errorMsg}`));
          }
        });
        
        mysqldump.on('error', (error) => {
          clearTimeout(timeout);
          writeStream.end();
          reject(error);
        });
        
        // Handle write stream errors
        writeStream.on('error', (error) => {
          clearTimeout(timeout);
          mysqldump.kill();
          reject(error);
        });
      });
      
      console.log(`✅ Backup created successfully: ${outputFile}`);
      
      if (backupConfig.compressBackups) {
        await this.compressFile(outputFile);
      }
      
      return outputFile;
    } catch (error) {
      // Check if it's a permission-related error and suggest fallback
      if (this.isPermissionError(error.message)) {
        console.log('⚠️  mysqldump failed due to insufficient privileges');
        console.log('💡 This is common with limited database users');
        console.log('🔄 Falling back to Node.js backup method...');
        throw new Error('PERMISSION_DENIED');
      }
      throw new Error(`mysqldump failed: ${error.message}`);
    }
  }

  // Check if error is related to insufficient privileges
  isPermissionError(errorMessage) {
    const permissionErrors = [
      'Access denied',
      'you need (at least one of) the PROCESS privilege',
      'Access denied for user',
      'insufficient privileges',
      'permission denied'
    ];
    
    return permissionErrors.some(err => 
      errorMessage.toLowerCase().includes(err.toLowerCase())
    );
  }

  // Helper method to check if file exists
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Check user privileges and provide helpful information
  async checkUserPrivileges() {
    try {
      const connection = await mysql.createConnection(dbConfig);
      
      // Check current user
      const [userResult] = await connection.execute('SELECT USER(), CURRENT_USER()');
      console.log(`👤 Current user: ${userResult[0]['USER()']}`);
      
      // Check privileges for current database
      const [privileges] = await connection.execute(`
        SELECT 
          TABLE_SCHEMA,
          TABLE_NAME,
          PRIVILEGE_TYPE
        FROM INFORMATION_SCHEMA.TABLE_PRIVILEGES 
        WHERE GRANTEE = ? AND TABLE_SCHEMA = ?
      `, [userResult[0]['CURRENT_USER()'], dbConfig.database]);
      
      console.log(`🔑 User privileges for ${dbConfig.database}:`);
      if (privileges.length === 0) {
        console.log('   ⚠️  No specific table privileges found');
      } else {
        const uniquePrivileges = [...new Set(privileges.map(p => p.PRIVILEGE_TYPE))];
        console.log(`   ✅ Privileges: ${uniquePrivileges.join(', ')}`);
      }
      
      await connection.end();
      
      // Provide helpful information about fixing privileges
      console.log('\n💡 To fix mysqldump permission issues, run as root:');
      console.log(`   GRANT SELECT, SHOW VIEW, LOCK TABLES ON ${dbConfig.database}.* TO '${dbConfig.user}'@'${dbConfig.host || 'localhost'};`);
      console.log(`   GRANT PROCESS ON *.* TO '${dbConfig.user}'@'${dbConfig.host || 'localhost'};`);
      console.log(`   FLUSH PRIVILEGES;`);
      console.log('\n🔒 For production, consider creating a dedicated backup user with minimal privileges');
      console.log('   Note: PROCESS privilege is global and applies to all databases');
      
    } catch (error) {
      console.warn(`⚠️  Could not check user privileges: ${error.message}`);
    }
  }

  async backupWithNodeJS() {
    console.log('🔄 Creating backup with Node.js...');
    
    try {
      const connection = await mysql.createConnection(dbConfig);
      console.log('✅ Database connection established');
      
      // Get all tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📊 Found ${tables.length} tables to backup`);
      
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
          const schemaContent = await this.getTableSchema(connection, tableName);
          backupContent += schemaContent;
          console.log(`   ✅ Schema backed up for ${tableName}`);
        }
        
        if (backupConfig.includeData) {
          const dataContent = await this.getTableData(connection, tableName);
          backupContent += dataContent;
          console.log(`   ✅ Data backed up for ${tableName}`);
        }
        
        backupContent += '\n';
      }
      
      await connection.end();
      console.log('✅ Database connection closed');
      
      // Ensure backup directory exists
      if (!await this.fileExists(this.backupDir)) {
        console.log(`📁 Creating backup directory: ${this.backupDir}`);
        await this.createBackupDirectory();
      }
      
      // Write backup file
      const outputFile = path.join(this.backupDir, `${dbConfig.database}_backup.sql`);
      console.log(`📝 Writing backup to: ${outputFile}`);
      
      await fs.writeFile(outputFile, backupContent, 'utf8');
      
      // Verify file was written
      if (await this.fileExists(outputFile)) {
        const stats = await fs.stat(outputFile);
        console.log(`✅ Backup file written successfully: ${stats.size} bytes`);
      } else {
        throw new Error('Backup file was not created after write operation');
      }
      
      if (backupConfig.compressBackups) {
        try {
          const compressedFile = await this.compressFile(outputFile);
          console.log(`✅ Compression completed: ${compressedFile}`);
          return compressedFile;
        } catch (compressionError) {
          console.warn(`⚠️  Compression failed, returning uncompressed file: ${compressionError.message}`);
          return outputFile;
        }
      }
      
      return outputFile;
    } catch (error) {
      console.error('❌ Node.js backup error details:', error);
      throw new Error(`Node.js backup failed: ${error.message}`);
    }
  }

  async getTableSchema(connection, tableName) {
    const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
    const createStatement = createTable[0]['Create Table'];
    
    return `-- Table structure for table \`${tableName}\`\n` +
           `DROP TABLE IF EXISTS \`${tableName}\`;\n` +
           `${createStatement};\n\n`;
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
      
      // Check if gzip is available
      try {
        await execAsync('gzip --version');
        
        // Use spawn for compression to avoid shell interpretation issues
        const gzip = spawn('gzip', [filePath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        await new Promise((resolve, reject) => {
          gzip.on('close', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`gzip exited with code ${code}`));
            }
          });
          
          gzip.on('error', (error) => {
            reject(error);
          });
        });
        
        console.log(`✅ File compressed with gzip: ${compressedPath}`);
        return compressedPath;
      } catch (error) {
        // Fallback to Node.js zlib compression
        console.log('⚠️  gzip not available, using Node.js compression...');
        
        const gzip = utilPromisify(zlib.gzip);
        const readFile = utilPromisify(fsSync.readFile);
        
        const fileContent = await readFile(filePath);
        const compressedContent = await gzip(fileContent);
        
        await fs.writeFile(compressedPath, compressedContent);
        
        // Remove original file
        await fs.unlink(filePath);
        
        console.log(`✅ File compressed with Node.js zlib: ${compressedPath}`);
        return compressedPath;
      }
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
      if (!backupConfig.skipMysqldump && await this.checkMysqldump()) {
        try {
          backupFile = await this.backupWithMysqldump();
        } catch (error) {
          if (error.message === 'PERMISSION_DENIED') {
            console.log('🔄 mysqldump failed due to privileges, using Node.js fallback');
            if (!backupConfig.skipPrivilegeCheck) {
              console.log('📋 Checking user privileges for troubleshooting...');
              await this.checkUserPrivileges();
            }
            backupFile = await this.backupWithNodeJS();
          } else {
            throw error;
          }
        }
      } else {
        if (backupConfig.skipMysqldump) {
          console.log('🔄 Skipping mysqldump, using Node.js method directly');
        } else {
          console.log('⚠️  mysqldump not available, using Node.js fallback');
        }
        backupFile = await this.backupWithNodeJS();
      }
      
      // Cleanup old backups
      await this.cleanupOldBackups();
      
      // Verify backup file exists before creating info
      if (!await this.fileExists(backupFile)) {
        throw new Error(`Backup file was not created: ${backupFile}`);
      }
      
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
  --nodejs-only       Skip mysqldump and use Node.js method directly
  --skip-privilege-check Skip checking user privileges

Examples:
  node backup_database.js
  node backup_database.js --schema-only
  node backup_database.js --no-compress
  node backup_database.js --retention-days 7
  node backup_database.js --nodejs-only

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
  if (args.includes('--nodejs-only')) {
    backupConfig.skipMysqldump = true;
  }
  if (args.includes('--skip-privilege-check')) {
    backupConfig.skipPrivilegeCheck = true;
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
