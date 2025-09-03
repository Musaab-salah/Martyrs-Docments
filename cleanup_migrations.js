const fs = require('fs');
const path = require('path');

// List of old migration files to remove
const oldMigrationFiles = [
  'database/migration_add_status_field.sql',
  'database/migration_add_approved.sql',
  'database/migration_remove_coordinates_requirement.sql'
];

// List of old migration scripts to remove
const oldMigrationScripts = [
  'run-migration.js',
  'run-status-migration.js',
  'run-coordinates-migration.js',
  'update-status-19.js',
  'add-martyr-19.js',
  'add-martyr-20.js',
  'approve-martyr-19.js',
  'approve-martyr-20.js',
  'check-martyr-19.js',
  'check-martyr-20.js'
];

function cleanupOldFiles() {
  console.log('🧹 Cleaning up old migration files...');
  
  let removedCount = 0;
  
  // Remove old migration SQL files
  oldMigrationFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`   ✅ Removed: ${filePath}`);
        removedCount++;
      } catch (error) {
        console.log(`   ❌ Failed to remove: ${filePath} - ${error.message}`);
      }
    } else {
      console.log(`   ℹ️  Not found: ${filePath}`);
    }
  });
  
  // Remove old migration scripts
  oldMigrationScripts.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`   ✅ Removed: ${filePath}`);
        removedCount++;
      } catch (error) {
        console.log(`   ❌ Failed to remove: ${filePath} - ${error.message}`);
      }
    } else {
      console.log(`   ℹ️  Not found: ${filePath}`);
    }
  });
  
  console.log(`\n🎉 Cleanup completed! Removed ${removedCount} files.`);
  console.log('\n📋 Remaining files:');
  console.log('   ✅ database/final_schema.sql - Final schema reference');
  console.log('   ✅ database/init.sql - Original schema (keep for reference)');
  console.log('   ✅ migrate_database.js - Migration script');
  console.log('   ✅ export_current_data.sql - Data export script');
  console.log('   ✅ complete_migration.sql - Complete migration reference');
  console.log('   ✅ DATABASE_MIGRATION_README.md - Migration guide');
  
  console.log('\n💡 Next steps:');
  console.log('   1. Test your application thoroughly');
  console.log('   2. Verify all API endpoints work correctly');
  console.log('   3. Check that admin functions work as expected');
  console.log('   4. Monitor performance improvements');
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupOldFiles();
}

module.exports = { cleanupOldFiles };
