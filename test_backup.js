#!/usr/bin/env node

const DatabaseBackup = require('./backup_database.js');

async function testBackup() {
  try {
    console.log('🧪 Testing database backup...');
    
    const backup = new DatabaseBackup();
    await backup.createBackup();
    
    console.log('✅ Test backup completed successfully!');
  } catch (error) {
    console.error('❌ Test backup failed:', error.message);
    process.exit(1);
  }
}

// Run test if called directly
if (require.main === module) {
  testBackup();
}

module.exports = testBackup;
