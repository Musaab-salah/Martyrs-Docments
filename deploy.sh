#!/bin/bash

# Martyrs Archive Server Deployment Script
# This script installs Node.js 22, sets up the application, creates systemd service, and handles environment variables

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="martyrs-archive"
APP_USER="martyrs"
APP_DIR="/opt/martyrs-archive"
SERVICE_NAME="martyrs-archive"
NODE_VERSION="22"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Function to handle cleanup on exit
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        print_error "Deployment failed with exit code $exit_code"
        print_status "Check the logs above for details"
    fi
    exit $exit_code
}

# Set trap for cleanup
trap cleanup EXIT

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root (use sudo)"
    exit 1
fi

print_status "Starting deployment of Martyrs Archive Server..."

# Validate prerequisites
print_status "Validating prerequisites..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if required files exist
if [ ! -f "$SCRIPT_DIR/package.json" ]; then
    print_error "package.json not found in script directory"
    exit 1
fi

if [ ! -d "$SCRIPT_DIR/server" ]; then
    print_error "server directory not found in script directory"
    exit 1
fi

# Check OS compatibility
if [ ! -f /etc/debian_version ]; then
    print_error "This script is designed for Debian/Ubuntu systems"
    exit 1
fi

print_success "Prerequisites validation passed"

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required system packages
print_status "Installing required system packages..."
apt install -y curl wget gnupg2 software-properties-common build-essential mysql-server || {
    print_error "Failed to install required system packages"
    exit 1
}

# Secure MySQL installation
print_status "Configuring MySQL database..."
systemctl start mysql
systemctl enable mysql

# Generate random passwords
DB_PASSWORD=$(openssl rand -base64 32)
ADMIN_PASSWORD=$(openssl rand -base64 16)
JWT_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)

# Create database and user
mysql -e "CREATE DATABASE IF NOT EXISTS martyrs_archive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'martyrs_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON martyrs_archive.* TO 'martyrs_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

print_success "Database configured with secure credentials"

# Install Node.js 22
print_status "Installing Node.js ${NODE_VERSION}..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Verify Node.js installation
NODE_INSTALLED_VERSION=$(node --version)
print_success "Node.js installed: ${NODE_INSTALLED_VERSION}"

# Create application user if it doesn't exist
if ! id "$APP_USER" &>/dev/null; then
    print_status "Creating application user: ${APP_USER}"
    useradd --system --shell /bin/bash --home $APP_DIR --create-home $APP_USER
else
    print_warning "User ${APP_USER} already exists"
fi

# Create application directory
print_status "Setting up application directory: ${APP_DIR}"
mkdir -p $APP_DIR
mkdir -p $APP_DIR/uploads
mkdir -p $APP_DIR/logs

# Copy application files
print_status "Copying application files..."
cp -r "$SCRIPT_DIR/server" $APP_DIR/ || {
    print_error "Failed to copy server directory"
    exit 1
}
cp "$SCRIPT_DIR/package.json" $APP_DIR/ || {
    print_error "Failed to copy package.json"
    exit 1
}
cp "$SCRIPT_DIR/setup.js" $APP_DIR/ 2>/dev/null || print_warning "setup.js not found, skipping"

# Create environment file
print_status "Creating environment configuration..."
cat > $APP_DIR/.env << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=martyrs_user
DB_PASSWORD=$DB_PASSWORD
DB_NAME=martyrs_archive

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# Client Configuration
CLIENT_URL=https://yourdomain.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=${APP_DIR}/uploads

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=$ADMIN_PASSWORD

# Security
SESSION_SECRET=$SESSION_SECRET
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info
LOG_FILE=${APP_DIR}/logs/app.log
EOF

# Save credentials for later reference
cat > /root/martyrs-credentials.txt << EOF
=== MARTYRS ARCHIVE DEPLOYMENT CREDENTIALS ===
Date: $(date)
Database Password: $DB_PASSWORD
Admin Password: $ADMIN_PASSWORD
JWT Secret: $JWT_SECRET
Session Secret: $SESSION_SECRET

IMPORTANT: Store these credentials securely and delete this file!
EOF

chmod 600 /root/martyrs-credentials.txt

print_success "Environment file created with secure auto-generated credentials"
print_warning "Credentials saved to /root/martyrs-credentials.txt - store securely and delete!"

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
cd $APP_DIR
sudo -u $APP_USER npm ci --production --silent || {
    print_warning "npm ci failed, trying npm install..."
    sudo -u $APP_USER npm install --production --silent || {
        print_error "Failed to install Node.js dependencies"
        exit 1
    }
}

# Set proper permissions
print_status "Setting file permissions..."
chown -R $APP_USER:$APP_USER $APP_DIR
chmod 755 $APP_DIR
chmod 644 $APP_DIR/.env
chmod 755 $APP_DIR/uploads
chmod 755 $APP_DIR/logs

# Create systemd service file
print_status "Creating systemd service..."
cat > /etc/systemd/system/${SERVICE_NAME}.service << EOF
[Unit]
Description=Martyrs Archive API Server
Documentation=https://github.com/yourorg/martyrs-archive
After=network.target

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
EnvironmentFile=$APP_DIR/.env
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$APP_DIR/uploads $APP_DIR/logs
ProtectHome=true
ProtectControlGroups=true
ProtectKernelModules=true
ProtectKernelTunables=true

# Resource limits
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
print_status "Configuring systemd service..."
systemctl daemon-reload
systemctl enable $SERVICE_NAME

# Start the service
print_status "Starting $SERVICE_NAME service..."
systemctl start $SERVICE_NAME || {
    print_error "Failed to start service. Check logs with: journalctl -u $SERVICE_NAME"
    exit 1
}

# Wait a moment and check if service is running
sleep 3
if systemctl is-active --quiet $SERVICE_NAME; then
    print_success "Service $SERVICE_NAME is running successfully"
else
    print_error "Service failed to start. Check: systemctl status $SERVICE_NAME"
    exit 1
fi

# Create logrotate configuration
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/$SERVICE_NAME << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 0644 $APP_USER $APP_USER
    postrotate
        systemctl reload $SERVICE_NAME > /dev/null 2>&1 || true
    endscript
}
EOF

# Install PM2 as alternative process manager (optional)
print_status "Installing PM2 as backup process manager..."
npm install -g pm2 || {
    print_error "Failed to install PM2 globally"
    exit 1
}

# Configure PM2 startup for the app user (not root)
print_status "Configuring PM2 startup for user $APP_USER..."
sudo -u $APP_USER bash -c 'cd /opt/martyrs-archive && pm2 startup' || {
    print_warning "PM2 startup configuration failed, continuing with systemd only"
}

# Create PM2 ecosystem file
cat > $APP_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'server/index.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: '$APP_DIR/logs/combined.log',
    out_file: '$APP_DIR/logs/out.log',
    error_file: '$APP_DIR/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

chown $APP_USER:$APP_USER $APP_DIR/ecosystem.config.js

# Create deployment helper scripts
print_status "Creating helper scripts..."

# Update script
cat > $APP_DIR/update.sh << 'EOF'
#!/bin/bash
set -e
cd /opt/martyrs-archive
echo "Stopping service..."
sudo systemctl stop martyrs-archive
echo "Updating dependencies..."
sudo -u martyrs npm install --production
echo "Starting service..."
sudo systemctl start martyrs-archive
echo "Update complete!"
EOF

# Status script
cat > $APP_DIR/status.sh << 'EOF'
#!/bin/bash
echo "=== Service Status ==="
sudo systemctl status martyrs-archive --no-pager
echo ""
echo "=== Service Logs (last 20 lines) ==="
sudo journalctl -u martyrs-archive -n 20 --no-pager
echo ""
echo "=== Process Info ==="
ps aux | grep "node.*server/index.js" | grep -v grep || echo "Process not running"
echo ""
echo "=== Port Status ==="
sudo netstat -tlnp | grep :5000 || echo "Port 5000 not in use"
EOF

chmod +x $APP_DIR/update.sh $APP_DIR/status.sh

# Create nginx configuration template
print_status "Creating nginx configuration template..."
cat > $APP_DIR/nginx.conf.template << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration (add your SSL certificates)
    # ssl_certificate /path/to/your/certificate.crt;
    # ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # File upload size limit
    client_max_body_size 10M;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files
    location /uploads {
        alias $APP_DIR/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API health check
    location /api/health {
        access_log off;
        proxy_pass http://127.0.0.1:5000;
    }
}
EOF

print_success "Deployment completed successfully!"

echo ""
print_status "=== DEPLOYMENT STATUS ==="
echo "✓ Database configured and running"
echo "✓ Application deployed and started"
echo "✓ Service enabled for auto-start"
echo "✓ Secure credentials auto-generated"
echo ""
print_status "=== NEXT STEPS ==="
echo "1. Configure your domain in: $APP_DIR/.env (CLIENT_URL)"
echo "2. Set up SSL certificates and nginx"
echo "3. Configure firewall: ufw allow 80,443"
echo "4. Store credentials from /root/martyrs-credentials.txt securely"
echo "5. Delete credentials file: rm /root/martyrs-credentials.txt"
echo ""
print_status "=== HELPER COMMANDS ==="
echo "• Update app: $APP_DIR/update.sh"
echo "• Check status: $APP_DIR/status.sh"
echo "• View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "• Restart service: sudo systemctl restart $SERVICE_NAME"
echo ""
print_status "=== SERVICE STATUS ==="
systemctl status $SERVICE_NAME --no-pager -l
echo ""
print_status "=== SERVICE URL ==="
echo "Local access: http://localhost:5000"
echo "Admin login: admin@yourdomain.com / $ADMIN_PASSWORD"
echo ""
print_warning "Remember to:"
echo "• Set up SSL certificates"
echo "• Configure firewall (ufw allow 80,443)"
echo "• Set up regular backups"
echo "• Update CLIENT_URL in .env file"

print_success "Martyrs Archive Server deployment script completed!"