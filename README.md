# Martyrs Archive - Digital Memorial Platform

A comprehensive digital archive platform for documenting and honoring martyrs with respect and organization. Built with React, Node.js, and MySQL with both traditional server and serverless deployment options.

## 🌐 Live Demo
- **Production**: https://martyrssud.com/
- **Development**: https://martyrs-azbfec8tt-musaabsalaheldin-9472s-projects.vercel.app
- **Repository**: https://github.com/Musaab-salah/Martyrs-Docments

## 🚀 Features

- **Digital Memorial**: Comprehensive documentation of martyrs with detailed information
- **Interactive Map**: Geographic visualization of martyrdom locations
- **Advanced Search**: Filter and search through the archive with multiple criteria
- **Image Management**: Secure file upload and storage for martyr photos
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Admin Panel**: Secure administrative interface for content management
- **Approval System**: Admin approval workflow for user-submitted martyrs
- **Statistics Dashboard**: Analytics and insights about the archive
- **Multi-language Support**: Arabic and English interface

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM v6** - Client-side routing
- **React Query** - Server state management and caching
- **React Hook Form** - Form handling
- **Chart.js** - Statistics visualization
- **Leaflet** - Interactive maps

### Backend (Dual Architecture)
- **Traditional Server**: Express.js application (`/server/`)
- **Serverless Functions**: Vercel-compatible functions (`/api/`)
- **MySQL** - Relational database with UTF8MB4 charset
- **JWT Authentication** - Admin authentication with bcrypt
- **Multer + Sharp** - File upload and image processing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Rate Limiting** - API protection

### Development Tools
- **Nodemon** - Auto-restart server during development
- **Concurrently** - Run multiple commands simultaneously
- **ESLint** - Code linting and formatting

## 📁 Project Structure

```
Martyrs-Docments/
├── api/                        # Vercel serverless functions
│   ├── auth/login.js          # Admin authentication
│   ├── martyrs/index.js       # Martyrs CRUD operations
│   ├── martyrs/[id].js        # Individual martyr operations
│   ├── admin/martyrs.js       # Admin martyrs management
│   ├── stats/index.js         # Statistics endpoint
│   ├── tributes/index.js      # Tributes management
│   └── health.js              # Health check
├── client/                     # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   └── src/
│       ├── components/         # Reusable UI components
│       │   ├── Header.js       # Unified header component
│       │   └── ProtectedRoute.js # Admin route protection
│       ├── pages/             # Page components
│       │   ├── HomePage.js     # Landing page
│       │   ├── MartyrsPage.js  # Martyrs listing
│       │   ├── MapPage.js      # Interactive map
│       │   └── admin/         # Admin pages
│       │       ├── AdminLoginPage.js
│       │       ├── AdminDashboardPage.js
│       │       └── AdminAddMartyrPage.js
│       ├── services/          # API service layer
│       │   └── api.js         # API integration with mock support
│       ├── App.js             # Main application with routing
│       └── index.js           # Application entry point
├── server/                    # Traditional Express server
│   ├── config/               # Configuration files
│   │   └── database.js       # Database configuration
│   ├── middleware/           # Express middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── upload.js         # File upload handling
│   │   └── validation.js     # Input validation
│   ├── routes/               # API routes
│   │   ├── martyrs.js        # Martyrs endpoints
│   │   ├── auth.js           # Authentication routes
│   │   ├── admin.js          # Admin routes
│   │   └── stats.js          # Statistics routes
│   └── index.js              # Server entry point
├── database/                  # Database scripts and migrations
│   ├── final_schema.sql       # Clean database schema
│   ├── migrate_preserve_data.js # Data-preserving migration
│   └── setup.js               # Database initialization
├── nginx/                     # Nginx configuration
│   └── martyrs-archive.conf  # Production nginx config
├── vercel.json               # Vercel deployment config
├── railway.json              # Railway deployment config
├── render.yaml               # Render deployment config
├── CLAUDE.md                 # Claude Code instructions
├── DEPLOYMENT_GUIDE.md       # Comprehensive deployment guide
└── package.json              # Project dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Yarn (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd martyrs-archive
   ```

2. **Install dependencies**
   ```bash
   yarn install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=martyrs_archive
   NODE_ENV=development
   ```

4. **Initialize the database**
   ```bash
   yarn setup
   ```

5. **Start the development servers**
   ```bash
   yarn dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Martyrs
- `GET /martyrs` - Get all martyrs with pagination and filters
- `GET /martyrs/:id` - Get a specific martyr
- `GET /martyrs/stats/summary` - Get statistics
- `POST /martyrs/public` - Add a new martyr (public)
- `POST /martyrs` - Add a new martyr (admin)
- `PUT /martyrs/:id` - Update a martyr
- `DELETE /martyrs/:id` - Delete a martyr

#### Health Check
- `GET /health` - API health status

### Query Parameters

#### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### Filters
- `search` - Search in name and occupation
- `education_level` - Filter by education level
- `date_from` - Filter by date from
- `date_to` - Filter by date to

### Example Requests

```bash
# Get all martyrs
curl http://localhost:5000/api/martyrs

# Search martyrs
curl "http://localhost:5000/api/martyrs?search=ali&education_level=university"

# Get statistics
curl http://localhost:5000/api/martyrs/stats/summary
```

## 🔧 Development

### Available Scripts

```bash
# Development
yarn dev              # Start both frontend (port 3000) and backend (port 5000)
yarn client           # Start React frontend only  
yarn server           # Start Express backend only
yarn install-all     # Install dependencies for root, client, and server

# Production
yarn build           # Build React app for production
yarn start           # Start production server

# Database Management  
yarn setup           # Initialize database with schema

# Quality & Testing
# Manual testing through development servers
# API testing via health check endpoints at /api/health
```


### Code Organization

#### Frontend Best Practices
- **Component Structure**: Functional components with hooks
- **State Management**: Custom hooks for reusable logic
- **API Communication**: Centralized service layer
- **Error Handling**: Comprehensive error boundaries
- **Performance**: React.memo, useMemo, useCallback
- **Accessibility**: ARIA labels, keyboard navigation

#### Backend Best Practices
- **Middleware Pattern**: Separation of concerns
- **Error Handling**: Centralized error management
- **Validation**: Input sanitization and validation
- **Security**: Helmet, rate limiting, CORS
- **Database**: Connection pooling, prepared statements
- **File Handling**: Secure upload with validation

### Performance Optimizations

#### Frontend
- **Code Splitting**: Lazy loading of components
- **Memoization**: Prevent unnecessary re-renders
- **Image Optimization**: Responsive images with lazy loading
- **Bundle Optimization**: Tree shaking and minification

#### Backend
- **Database Indexing**: Optimized queries
- **Caching**: Response caching for static data
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Efficient database connections

## 🔒 Security Features

- **Input Validation**: Server-side validation with express-validator
- **File Upload Security**: File type and size restrictions
- **Rate Limiting**: Protection against abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet**: Security headers
- **SQL Injection Protection**: Prepared statements
- **XSS Protection**: Content Security Policy

## 📊 Database Schema

### Martyrs Table
```sql
CREATE TABLE martyrs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  date_of_martyrdom DATE NOT NULL,
  place_of_martyrdom TEXT NOT NULL,
  education_level ENUM('primary', 'secondary', 'university', 'postgraduate', 'other') NOT NULL,
  university_name VARCHAR(255),
  faculty VARCHAR(255),
  department VARCHAR(255),
  school_state VARCHAR(255),
  school_locality VARCHAR(255),
  spouse VARCHAR(255),
  children TEXT,
  occupation VARCHAR(255) NOT NULL,
  bio TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## ✅ Approval System

The platform includes a comprehensive approval system to ensure content quality and accuracy:

### How It Works

1. **User Submissions**: When users add martyrs through the public form, they are saved with `approved = false`
2. **Admin Review**: Admins can view all martyrs (approved and pending) in the admin dashboard
3. **Approval Process**: Admins can approve or unapprove martyrs with a single click
4. **Public Visibility**: Only approved martyrs (`approved = true`) are visible on the public client side

### Admin Features

- **View All Martyrs**: See both approved and pending submissions
- **Filter by Status**: Filter to show only pending or approved martyrs
- **Approve/Unapprove**: Toggle approval status with immediate effect
- **Edit & Delete**: Full CRUD operations on all martyrs
- **Bulk Operations**: Manage multiple martyrs efficiently

### API Endpoints

- `GET /api/martyrs` - Returns only approved martyrs (public)
- `GET /api/martyrs/admin/all` - Returns all martyrs with approval status (admin)
- `PATCH /api/martyrs/:id/approve` - Approve/unapprove a martyr (admin)
- `POST /api/martyrs/public` - Add martyr (public, sets approved = false)
- `POST /api/martyrs` - Add martyr (admin, sets approved = true)

### Database Schema

The `martyrs` table includes an `approved` boolean field:
```sql
ALTER TABLE martyrs ADD COLUMN approved BOOLEAN DEFAULT FALSE;
```

## 🚀 Deployment

The project supports multiple deployment architectures:

### 1. Traditional Server Deployment
- **Backend Service**: systemd service running on port 5000
- **Frontend**: Static files served by nginx
- **Database**: MySQL with `api` user for application access
- **SSL**: nginx with SSL certificates
- **Production Commands**:
  ```bash
  yarn build                             # Build React app for production  
  sudo systemctl start martyrs-archive  # Start backend service
  sudo systemctl enable martyrs-archive # Enable on boot
  sudo nginx -t && sudo systemctl reload nginx  # Deploy nginx config
  ```

### 2. Serverless Deployment (Vercel)
- **Functions**: `/api/` folder with Vercel-compatible serverless functions
- **Frontend**: React SPA with static generation
- **Database**: Remote MySQL database
- **Configuration**: See `vercel.json`

### 3. Other Platforms
- **Railway**: Container deployment (see `railway.json`)
- **Render**: Alternative hosting (see `render.yaml`)
- **Heroku**: Traditional PaaS (see `Procfile`)

### Environment Variables
```env
# Database Configuration
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=martyrs_archive

# Security
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=https://martyrssud.com,https://www.martyrssud.com

# Optional
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Use meaningful variable and function names
- Add comments for complex logic
- Follow ESLint configuration
- Write unit tests for critical functions
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Express.js community for the robust backend framework
- Tailwind CSS for the utility-first CSS framework
- All contributors and supporters of this project

## 📞 Support

For support and questions:
- Create an issue in the repository: https://github.com/Musaab-salah/Martyrs-Docments/issues
- Contact the development team
- Check the comprehensive documentation in the repository

## 📖 Additional Documentation

- `CLAUDE.md` - Instructions for Claude Code development
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide for Vercel serverless functions
- `DATABASE_MIGRATION_README.md` - Database migration and setup guide
- `ADMIN_ROUTING_IMPLEMENTATION.md` - Admin routing and authentication system
- `HOW_TO_RUN.md` - Detailed setup and running instructions

## 🔄 Recent Updates

- ✅ **Image Loading Fixed**: Corrected frontend URL paths and React rendering errors
- ✅ **Production Ready**: Removed console.log statements from production code
- ✅ **Database Refactored**: Improved connection handling and validation middleware
- ✅ **Multi-Deployment**: Added serverless functions for Vercel deployment
- ✅ **Admin System**: Implemented protected routes and unified header components
- ✅ **Documentation**: Comprehensive guides for deployment and development

---

**Note**: This is a memorial platform. Please handle all content with respect and sensitivity.
