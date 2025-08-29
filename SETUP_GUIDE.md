# 🚀 Quick Setup Guide - Martyrs Archive

## Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment
```bash
# Copy environment file
cp env.example .env

# Edit .env with your MySQL credentials
# At minimum, update DB_PASSWORD
```

### 3. Setup Database
```bash
# Run the setup script (creates database, tables, and admin account)
npm run setup
```

### 4. Start the Application
```bash
# Start both backend and frontend
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login
- **Default Admin**: 
  - Username: `sudansust`
  - Password: `sust@1989`

## 🔧 Configuration Options

### Essential Settings (.env file)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=martyrs_archive

# Security
JWT_SECRET=your-super-secret-key-change-this

# Optional: Google Maps API (for interactive map)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Optional Features
- **Google Maps**: Add API key for interactive map
- **Email**: Configure SMTP for notifications
- **File Storage**: Configure cloud storage for production

## 📱 Features Available

### Public Features
- ✅ Browse martyrs list
- ✅ Search and filter martyrs
- ✅ View detailed martyr profiles
- ✅ Submit tributes (with admin approval)
- ✅ View statistics
- ✅ Interactive map (with Google Maps API)

### Admin Features
- ✅ Secure login system
- ✅ Add/Edit/Delete martyrs
- ✅ Photo upload and management
- ✅ Martyr approval system
- ✅ Tribute approval system
- ✅ Statistics dashboard
- ✅ System settings

## 🛠️ Development

### Available Commands
```bash
npm run dev          # Start development servers
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm run setup        # Setup database and admin account
npm run migrate      # Run database migration (for existing installations)
```

### Project Structure
```
martyrs-archive/
├── server/          # Backend API (Express + MySQL)
├── client/          # Frontend (React + Tailwind)
├── uploads/         # File uploads
├── database/        # Database scripts
└── setup.js         # Setup script
```

## ✅ Approval System

The platform includes a comprehensive approval system for user-submitted martyrs:

### How It Works
1. **User Submissions**: Public users can submit martyrs through `/add-martyr`
2. **Pending Status**: New submissions are saved with `approved = false`
3. **Admin Review**: Admins can view and manage all submissions in the admin panel
4. **Approval Process**: Admins can approve/unapprove martyrs with one click
5. **Public Visibility**: Only approved martyrs appear on the public site

### Admin Workflow
1. Login to admin panel at `/admin/login`
2. Navigate to dashboard to see all martyrs
3. Filter by "في الانتظار" (pending) to see new submissions
4. Click "موافقة" (approve) to make a martyr public
5. Use "إلغاء الموافقة" (unapprove) to hide from public view

### Migration for Existing Installations
If you have an existing database, run the migration to add the approval system:
```bash
npm run migrate
```

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- Input validation
- File upload security
- CORS protection

## 📊 Database Schema

### Main Tables
- `martyrs` - Core martyr information
- `admins` - Admin user accounts
- `tributes` - Visitor tribute messages
- `media_gallery` - Media files
- `statistics` - Cached statistics

## 🎨 UI/UX Features

- Responsive design (mobile-friendly)
- Modern, respectful interface
- Accessibility compliant
- Loading states and error handling
- Search and filtering
- Interactive map

## 🚀 Production Deployment

### 1. Build Frontend
```bash
cd client && npm run build && cd ..
```

### 2. Configure Production Environment
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-production-db
JWT_SECRET=your-production-secret
```

### 3. Start Production Server
```bash
npm start
```

### Recommended Hosting
- **Backend**: DigitalOcean, AWS, Heroku
- **Database**: AWS RDS, DigitalOcean Managed Databases
- **File Storage**: AWS S3, DigitalOcean Spaces

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify MySQL is running
- Check credentials in .env file
- Ensure database exists

**Port Already in Use**
- Change PORT in .env file
- Kill existing processes

**File Upload Issues**
- Check uploads directory permissions
- Verify file size limits

**Admin Login Issues**
- Run `npm run setup` to recreate admin account
- Check JWT_SECRET in .env

### Getting Help
- Check the full README.md for detailed documentation
- Review server logs for error messages
- Ensure all dependencies are installed

## 📞 Support

For additional help:
- Full documentation: README.md
- Database schema: database/init.sql
- Environment variables: env.example

---

**Note**: This system is designed with respect and dignity. Please handle all content appropriately.
