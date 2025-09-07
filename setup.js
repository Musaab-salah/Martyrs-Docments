#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

console.log('🗄️  Martyrs Archive Database Setup');
console.log('==================================\n');

async function setupDatabase() {
  let connection;
  
  try {
    // Read the SQL file
    const schemaPath = path.join(__dirname, 'database', 'final_schema.sql');
    console.log('📖 Reading schema file:', schemaPath);
    
    const sqlContent = await fs.readFile(schemaPath, 'utf8');
    console.log('✅ Schema file loaded successfully');

    // Create connection without database (so we can drop/create it)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to MySQL server');

    // Split SQL into individual statements and execute them
    console.log('🔄 Setting up database...');
    
    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('SELECT'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await connection.execute(statement);
          if (statement.toUpperCase().includes('DROP DATABASE')) {
            console.log('🗑️  Old database dropped');
          } else if (statement.toUpperCase().includes('CREATE DATABASE')) {
            console.log('🏗️  New database created');
          } else if (statement.toUpperCase().includes('USE ')) {
            console.log('🔗 Connected to database');
          } else if (statement.toUpperCase().includes('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
            console.log(`📋 Created table: ${tableName ? tableName[1] : 'unknown'}`);
          } else if (statement.toUpperCase().includes('INSERT INTO')) {
            const tableName = statement.match(/INSERT INTO\s+(\w+)/i);
            if (tableName && tableName[1] !== 'martyrs') { // Don't log every martyr insert
              console.log(`📝 Inserted data into: ${tableName[1]}`);
            }
          }
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }
    
    console.log('✅ Database setup completed successfully!');

    // Verify the setup
    await connection.execute('USE martyrs_archive');
    const [martyrs] = await connection.execute('SELECT COUNT(*) as count FROM martyrs');
    const [admins] = await connection.execute('SELECT COUNT(*) as count FROM admins');
    
    console.log('\n📊 Database verification:');
    console.log(`   - Martyrs: ${martyrs[0].count} records`);
    console.log(`   - Admins: ${admins[0].count} accounts`);
    console.log(`   - Database: martyrs_archive`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: npm run server');
    console.log('2. Start the client: npm run client');
    console.log('3. Visit http://localhost:3000');
    console.log('4. Admin login: sudansust / sust@1989');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ENOENT') {
      console.error('💡 Make sure the database/final_schema.sql file exists');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure MySQL server is running');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Check if .env exists and remind about configuration
async function checkEnvFile() {
  try {
    await fs.access('.env');
  } catch (error) {
    console.log('⚠️  No .env file found. Using default MySQL connection settings:');
    console.log('   - Host: localhost');
    console.log('   - User: root');
    console.log('   - Password: (empty)');
    console.log('   - Port: 3306');
    console.log('\n💡 Create a .env file with your MySQL credentials if needed:\n');
    console.log('   DB_HOST=localhost');
    console.log('   DB_USER=root');
    console.log('   DB_PASSWORD=your_password');
    console.log('   DB_PORT=3306\n');
  }
}

// Run the setup
async function main() {
  await checkEnvFile();
  await setupDatabase();
}

main();