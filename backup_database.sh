#!/bin/bash

# Database Backup Shell Script
# Run this script to backup your database

echo "🚀 Starting Database Backup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found"
    echo "Please create a .env file with your database configuration"
    echo ""
    echo "Example .env file:"
    echo "DB_HOST=localhost"
    echo "DB_USER=root"
    echo "DB_PASSWORD=your_password"
    echo "DB_NAME=martyrs_archive"
    echo ""
fi

# Make the script executable
chmod +x backup_database.js

# Run the backup script with all arguments
echo "Running backup script..."
echo "Command: node backup_database.js $@"
echo ""

if node backup_database.js "$@"; then
    echo ""
    echo "🎉 Backup completed successfully!"
else
    echo ""
    echo "❌ Backup failed with exit code: $?"
    exit 1
fi
