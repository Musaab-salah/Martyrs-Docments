# Nginx Configuration

This directory contains nginx configuration files for the Martyrs Archive application.

## Files

- `martyrs-archive.conf` - Main nginx server configuration

## Deployment

To deploy this configuration:

```bash
# Copy the configuration to nginx sites-available
sudo cp nginx/martyrs-archive.conf /etc/nginx/sites-available/martyrs-archive

# Enable the site
sudo ln -sf /etc/nginx/sites-available/martyrs-archive /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Configuration Details

The nginx configuration includes:

- **HTTP to HTTPS redirect** on port 80
- **SSL/TLS termination** on port 443
- **Static file serving** from React build directory
- **API proxy** to backend on port 5000
- **SPA routing support** with fallback to index.html
- **Static asset caching** with appropriate headers
- **Upload directory** serving with long-term caching

## SSL Certificates

The configuration currently uses temporary self-signed certificates:
- Certificate: `/etc/ssl/certs/martyrssud-temp.crt`
- Private Key: `/etc/ssl/private/martyrssud-temp.key`

For production, replace these with proper SSL certificates from Let's Encrypt or a certificate authority.