@echo off
echo Starting Database Backup...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found
    echo Please create a .env file with your database configuration
    echo.
    echo Example .env file:
    echo DB_HOST=localhost
    echo DB_USER=root
    echo DB_PASSWORD=your_password
    echo DB_NAME=martyrs_archive
    echo.
)

REM Run the backup script
echo Running backup script...
node backup_database.js %*

echo.
echo Backup completed!
pause
