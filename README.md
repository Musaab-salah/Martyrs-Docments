# Martyrs Archive - Digital Memorial Platform

A comprehensive digital archive system for documenting and honoring martyrs with respect, organization, and modern web technologies.

## 🌟 Features

### Core Features
- **Digital Archive**: Complete database system for storing martyr information
- **Profile Management**: Detailed profiles with photos, biographies, and personal stories
- **Search & Filtering**: Advanced search by name, location, date, and age
- **Interactive Map**: Geographic visualization of martyr locations
- **Admin Panel**: Secure dashboard for content management
- **Visitor Tributes**: Public tribute system with admin approval
- **Statistics Dashboard**: Comprehensive analytics and reporting
- **Responsive Design**: Mobile-friendly interface

### Technical Features
- **Modern Stack**: Node.js, Express, React, MySQL
- **Security**: JWT authentication, rate limiting, input validation
- **Performance**: Image optimization, caching, pagination
- **SEO Optimized**: Meta tags, structured data, social sharing
- **Accessibility**: WCAG compliant design
- **Backup System**: Automated data backup and recovery

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd martyrs-archive
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE martyrs_archive;
   USE martyrs_archive;
   EXIT;
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

5. **Initialize Database**
   ```bash
   # Start the server (database tables will be created automatically)
   npm run server
   ```

6. **Create Admin Account**
   ```bash
   # The system will create a default super admin account
   # Username: admin
   # Password: admin123
   # Change these credentials immediately after first login
   ```

7. **Start Development Servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start separately:
   npm run server    # Backend on port 5000
   npm run client    # Frontend on port 3000
   ```

## 📁 Project Structure

```
martyrs-archive/
├── server/                 # Backend API
│   ├── config/            # Database and app configuration
│   ├── controllers/       # Business logic
│   ├── middleware/        # Authentication and validation
│   ├── routes/           # API endpoints
│   └── index.js          # Server entry point
├── client/                # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
├── uploads/              # File uploads
│   ├── photos/          # Martyr photos
│   ├── documents/       # PDFs and documents
│   └── media/           # Videos and other media
├── database/            # Database scripts and migrations
└── package.json         # Project dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=martyrs_archive

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Google Maps API (for interactive map)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 📊 Database Schema

### Main Tables
- **martyrs**: Core martyr information
- **admins**: Admin user accounts
- **tributes**: Visitor tribute messages
- **media_gallery**: Media files and documents
- **statistics**: Cached statistics data

### Key Fields
- Full name, photo, place of martyrdom
- Date of martyrdom, age, biography
- Education, occupation, personal story
- Geographic coordinates for mapping
- Approval status for tributes

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **File Upload Security**: Type and size validation
- **SQL Injection Protection**: Parameterized queries

## 🎨 UI/UX Features

- **Responsive Design**: Works on all devices
- **Modern Interface**: Clean, respectful design
- **Accessibility**: WCAG 2.1 compliant
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages
- **Search & Filter**: Intuitive data discovery
- **Interactive Map**: Geographic visualization

## 📱 Admin Features

### Dashboard
- Overview statistics
- Recent activity feed
- System health monitoring
- Quick actions

### Content Management
- Add/Edit/Delete martyrs
- Photo upload and optimization
- Tribute approval system
- Media gallery management

### System Administration
- User management
- System settings
- Backup management
- Activity logs

## 🔍 Search & Filtering

### Search Options
- **Name Search**: Full-text search by martyr name
- **Location Filter**: Filter by city/region
- **Date Range**: Filter by year of martyrdom
- **Age Groups**: Filter by age categories
- **Advanced Filters**: Multiple criteria combination

### Results Display
- **Grid View**: Card-based layout
- **List View**: Detailed list format
- **Map View**: Geographic visualization
- **Pagination**: Efficient data loading

## 📈 Statistics & Analytics

### Public Statistics
- Total martyrs count
- Geographic distribution
- Age group analysis
- Yearly trends
- Tribute statistics

### Admin Analytics
- Detailed system metrics
- User activity tracking
- Content performance
- Search analytics
- Export capabilities

## 🗺️ Interactive Map

### Features
- **Geographic Visualization**: Map-based data display
- **Location Clustering**: Efficient marker display
- **Click Interactions**: Detailed location information
- **Search Integration**: Map-based search
- **Mobile Optimized**: Touch-friendly interface

### Map Data
- Martyr locations with coordinates
- City/region clustering
- Interactive popups with details
- Navigation integration

## 📤 Data Export

### Export Formats
- **JSON**: Complete data export
- **CSV**: Spreadsheet compatibility
- **PDF**: Printable reports
- **Excel**: Advanced analytics

### Export Options
- **Filtered Data**: Export search results
- **Date Ranges**: Time-based exports
- **Custom Fields**: Selective data export
- **Bulk Operations**: Multiple record export

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   PORT=5000
   DB_HOST=your-production-db-host
   JWT_SECRET=your-production-secret
   ```

2. **Database Migration**
   ```bash
   # Run database initialization
   npm run db:init
   ```

3. **Build Frontend**
   ```bash
   cd client
   npm run build
   cd ..
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

### Recommended Hosting
- **Backend**: DigitalOcean, AWS, Heroku
- **Database**: AWS RDS, DigitalOcean Managed Databases
- **File Storage**: AWS S3, DigitalOcean Spaces
- **CDN**: Cloudflare, AWS CloudFront

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development servers
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run db:init      # Initialize database
```

### Code Style
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Git commit messages
- **Component Structure**: Organized file structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow existing code style
- Add appropriate comments
- Update documentation
- Test thoroughly
- Respect the sensitive nature of the content

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with respect and dignity for those being memorialized
- Modern web technologies for optimal user experience
- Open source community for tools and libraries
- Contributors and maintainers

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: admin@martyrsarchive.com
- Documentation: [Wiki Link]

## 🔄 Updates

### Version 1.0.0
- Initial release
- Core functionality
- Admin panel
- Interactive map
- Statistics dashboard

### Planned Features
- Mobile app
- Advanced analytics
- Social media integration
- Multi-language support
- Advanced search algorithms

---

**Note**: This system is designed with the utmost respect for the sensitive nature of its content. Please ensure all content is handled with appropriate dignity and care.
