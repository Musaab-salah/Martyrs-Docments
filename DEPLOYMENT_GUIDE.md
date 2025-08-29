# 🚀 Vercel Deployment Guide - Martyrs Archive

## 📋 Overview

This guide covers the deployment of the Martyrs Archive project to Vercel with serverless functions. The project has been updated to use Vercel's serverless architecture instead of a traditional Express server.

## 🔧 What's Changed

### 1. Admin Credentials Updated
- **Username**: `sudansust`
- **Password**: `sust@1989`

### 2. API Architecture
- **Before**: Express server with localhost URLs
- **After**: Vercel serverless functions under `/api` folder
- **API Base URL**: Relative paths (e.g., `/api/martyrs`)

### 3. File Structure
```
├── api/                          # Vercel serverless functions
│   ├── auth/login.js            # Admin authentication
│   ├── martyrs/index.js         # Martyrs CRUD operations
│   ├── martyrs/[id].js          # Individual martyr operations
│   ├── stats/index.js           # Statistics endpoint
│   ├── tributes/index.js        # Tributes management
│   ├── admin/martyrs.js         # Admin martyrs view
│   ├── health.js                # Health check
│   └── package.json             # API dependencies
├── client/                       # React frontend
│   ├── build/                   # Production build
│   └── src/services/api.js      # Updated API calls
└── vercel.json                  # Vercel configuration
```

## 🌐 Deployment URL

**Production URL**: https://martyrs-c1x43y1fs-musaabsalaheldin-9472s-projects.vercel.app/

## 🔑 Environment Variables

Set these environment variables in your Vercel project settings:

```env
# Database Configuration
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=martyrs_archive

# Security
JWT_SECRET=your-super-secret-jwt-key

# Optional: Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 📊 API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/martyrs` - Get all approved martyrs
- `GET /api/martyrs/[id]` - Get specific martyr
- `POST /api/martyrs` - Add new martyr (public)
- `GET /api/stats` - Get statistics
- `GET /api/tributes` - Get approved tributes
- `POST /api/tributes` - Submit tribute

### Admin Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/martyrs` - Get all martyrs (including unapproved)
- `PUT /api/martyrs/[id]` - Update martyr
- `DELETE /api/martyrs/[id]` - Delete martyr
- `PATCH /api/martyrs/[id]` - Approve/unapprove martyr

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- Vercel CLI (optional)

### Setup Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd Martyrs-Docments
   npm install
   cd client && npm install && cd ..
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**
   ```bash
   npm run setup
   ```

4. **Update Admin Credentials** (if needed)
   ```bash
   node update-admin-credentials.js
   ```

5. **Build Frontend**
   ```bash
   cd client && npm run build && cd ..
   ```

## 🚀 Deployment Process

### Automatic Deployment (GitHub Integration)
1. Push to `cursor-upload` branch
2. Vercel automatically deploys from GitHub
3. Environment variables are configured in Vercel dashboard

### Manual Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

## ✅ Verification Checklist

### Admin Login
- [ ] Visit: `/admin/login`
- [ ] Login with: `sudansust` / `sust@1989`
- [ ] Verify admin dashboard loads

### API Endpoints
- [ ] Health check: `/api/health`
- [ ] Martyrs list: `/api/martyrs`
- [ ] Statistics: `/api/stats`
- [ ] Admin endpoints (with authentication)

### Frontend Features
- [ ] Homepage loads correctly
- [ ] Martyrs listing works
- [ ] Search and filtering functional
- [ ] Admin panel accessible
- [ ] File uploads work
- [ ] No CORS errors in browser console

## 🔍 Troubleshooting

### Common Issues

**1. Database Connection Errors**
- Verify environment variables in Vercel dashboard
- Check database accessibility from Vercel's servers
- Ensure database user has proper permissions

**2. Build Errors**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs in Vercel dashboard

**3. API 404 Errors**
- Verify API routes in `vercel.json`
- Check function files exist in `/api` folder
- Ensure proper file naming conventions

**4. CORS Issues**
- API functions include CORS headers
- Frontend uses relative paths
- No localhost URLs in production

### Debug Commands

```bash
# Check Vercel deployment status
vercel ls

# View function logs
vercel logs

# Test API locally
vercel dev
```

## 📞 Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Review browser console for errors

## 🔄 Updates and Maintenance

### Adding New Features
1. Create new API functions in `/api` folder
2. Update frontend API calls
3. Test locally with `vercel dev`
4. Deploy to production

### Database Migrations
1. Update database schema
2. Modify API functions as needed
3. Test thoroughly before deployment
4. Consider data migration scripts

---

**Note**: This deployment uses Vercel's serverless functions which have execution time limits. For heavy operations, consider using external services or optimizing the functions.
