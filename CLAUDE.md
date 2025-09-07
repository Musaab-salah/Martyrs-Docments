# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Martyrs Archive is a full-stack web application built to document and honor martyrs with a public memorial interface and administrative management system. The project uses React frontend with Express/Node.js backend and MySQL database.

## Development Commands

### Essential Commands
```bash
npm run dev              # Start both frontend (port 3000) and backend (port 5000)
npm run client           # Start React frontend only
npm run server           # Start Express backend only
npm run build           # Build React app for production
npm run install-all     # Install dependencies for root, client, and server
```

### Database Management
```bash
npm run setup           # Initialize database with schema
npm run migrate         # Run database migrations
npm run backup          # Create database backup
```

### Testing & Quality
- No automated test setup currently configured
- Manual testing through development servers
- API testing via health check endpoints at `/api/health`

## Architecture Overview

### Multi-Deployment Architecture
The project supports both traditional server deployment and serverless deployment:

1. **Traditional Express Server** (`/server/`) - Complete Express.js application
2. **Serverless Functions** (`/api/`) - Vercel-compatible serverless endpoints
3. **React SPA** (`/client/`) - Frontend application with Tailwind CSS

### Key Directories
- `/api/` - Serverless functions (auth, martyrs, admin, stats, tributes)
- `/client/src/pages/admin/` - Administrative interface
- `/client/src/services/` - API integration layer with mock API support
- `/server/routes/` - Traditional Express routes
- `/database/` - Schema files and migrations
- `/server/config/` - Database configuration

### Database Schema
MySQL database with UTF8MB4 charset for Arabic content support:
- `martyrs` - Main data with JSON location fields
- `admins` - Role-based access (admin/super_admin)
- `tributes` - User messages with approval system
- `media_gallery` - File management

### Frontend State Management
- React Query for server state and caching
- React Hook Form for form handling
- React Router DOM v6 for navigation
- Chart.js for statistics visualization
- Leaflet for interactive maps

## Configuration

### Environment Setup
The client can run with or without backend using `USE_MOCK_API` configuration. For full development:

1. Set up `.env` files in both `/client/` and `/server/`
2. Configure MySQL database connection
3. Use `npm run install-all` then `npm run dev`

### Deployment Targets
Multiple deployment configurations available:
- **Traditional Server** - Production deployment with systemd service and nginx
- **Vercel** - Serverless deployment (see `vercel.json`)
- **Railway** - Container deployment (see `railway.json`)
- **Render** - Alternative hosting (see `render.yaml`)
- **Heroku** - Traditional PaaS (see `Procfile`)

### Production Deployment
For traditional server deployment:

#### System Services
- **Backend Service**: `martyrs-archive.service` - systemd service running on port 5000
- **Frontend**: Static files served by nginx from `/opt/Martyrs-Docments/client/build`
- **Database**: MySQL with `api` user for application access

#### Nginx Configuration
- **Config Location**: `/nginx/martyrs-archive.conf` (tracked in repo)
- **Features**: HTTP to HTTPS redirect, static file serving, API proxy, SPA routing
- **SSL**: Currently using temporary self-signed certificates
- **Deployment**: Copy config to `/etc/nginx/sites-available/` and enable

#### Production Commands
```bash
npm run build                          # Build React app for production  
sudo systemctl start martyrs-archive  # Start backend service
sudo systemctl enable martyrs-archive # Enable on boot
sudo nginx -t && sudo systemctl reload nginx  # Deploy nginx config
```

## Security & API Design

### Authentication
JWT-based admin authentication with bcrypt password hashing. Admin routes protected by middleware in `/server/middleware/` and `/api/` functions.

### API Patterns
- RESTful design with consistent error handling
- Rate limiting and CORS configured
- File uploads handled via Multer with Sharp image processing
- Input validation using express-validator

### File Structure
When working on admin features, components are in `/client/src/pages/admin/`. Public features are in `/client/src/pages/`. API endpoints follow REST conventions with `/api/auth`, `/api/martyrs`, `/api/admin`, etc.