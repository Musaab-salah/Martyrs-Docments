# Martyrs Archive - Digital Memorial Platform

A comprehensive digital archive platform for documenting and honoring martyrs with respect and organization. Built with React, Node.js, and MySQL.

## 🚀 Features

- **Digital Memorial**: Comprehensive documentation of martyrs with detailed information
- **Interactive Map**: Geographic visualization of martyrdom locations
- **Advanced Search**: Filter and search through the archive with multiple criteria
- **Image Management**: Secure file upload and storage for martyr photos
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Admin Panel**: Secure administrative interface for content management
- **Statistics Dashboard**: Analytics and insights about the archive
- **Multi-language Support**: Arabic and English interface

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Custom Hooks** - Reusable state management
- **Service Layer** - Centralized API communication

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **Multer** - File upload handling
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Rate Limiting** - API protection
- **Compression** - Response optimization

### Development Tools
- **Nodemon** - Auto-restart server during development
- **Concurrently** - Run multiple commands simultaneously
- **ESLint** - Code linting and formatting

## 📁 Project Structure

```
martyrs-archive/
├── client/                     # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   └── src/
│       ├── components/         # Reusable UI components
│       │   ├── LoadingSpinner.js
│       │   └── ErrorMessage.js
│       ├── hooks/             # Custom React hooks
│       │   ├── useMartyrs.js
│       │   └── useFormValidation.js
│       ├── services/          # API service layer
│       │   └── api.js
│       ├── App.js             # Main application component
│       ├── index.js           # Application entry point
│       └── index.css          # Global styles
├── server/                    # Node.js backend
│   ├── config/               # Configuration files
│   │   └── database.js       # Database configuration
│   ├── middleware/           # Express middleware
│   │   ├── upload.js         # File upload handling
│   │   └── validation.js     # Input validation
│   ├── routes/               # API routes
│   │   └── martyrs.js        # Martyrs endpoints
│   ├── utils/                # Utility functions
│   │   └── errorHandler.js   # Error handling utilities
│   └── index.js              # Server entry point
├── uploads/                  # File upload directory
├── database/                 # Database scripts
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

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
   npm run install-all
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
   npm run setup
   ```

5. **Start the development servers**
   ```bash
   npm run dev
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
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only

# Production
npm run build        # Build frontend for production
npm start           # Start production server

# Database
npm run setup       # Initialize database
npm run db:init     # Alias for setup
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

## 🚀 Deployment

### Production Build

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```env
   NODE_ENV=production
   DB_HOST=your_production_db_host
   DB_USER=your_production_db_user
   DB_PASSWORD=your_production_db_password
   DB_NAME=your_production_db_name
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
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
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This is a memorial platform. Please handle all content with respect and sensitivity.
