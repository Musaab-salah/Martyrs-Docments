# Database Backup PowerShell Script
# Run this script to backup your database

Write-Host "Starting Database Backup..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  WARNING: .env file not found" -ForegroundColor Yellow
    Write-Host "Please create a .env file with your database configuration" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example .env file:" -ForegroundColor Cyan
    Write-Host "DB_HOST=localhost" -ForegroundColor White
    Write-Host "DB_USER=root" -ForegroundColor White
    Write-Host "DB_PASSWORD=your_password" -ForegroundColor White
    Write-Host "DB_NAME=martyrs_archive" -ForegroundColor White
    Write-Host ""
}

# Get command line arguments
$args = $args -join " "

# Run the backup script
Write-Host "Running backup script..." -ForegroundColor Cyan
Write-Host "Command: node backup_database.js $args" -ForegroundColor Gray
Write-Host ""

try {
    if ($args) {
        node backup_database.js $args
    } else {
        node backup_database.js
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Backup completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Backup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error running backup script: $_" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
