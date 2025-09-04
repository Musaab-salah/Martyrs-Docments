const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Import modules
const { testConnection, closePool } = require('./config/database');
const { handleError } = require('./utils/errorHandler');

// Import routes
const martyrsRoutes = require('./routes/martyrs');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const statsRoutes = require('./routes/stats');
const tributesRoutes = require('./routes/tributes');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      scriptSrcAttr: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Martyrs Archive API is running',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Simple test endpoint for martyrs
app.get('/api/martyrs/test', (req, res) => {
  res.json({
    martyrs: [
      {
        id: 1,
        name_ar: "أحمد محمد",
        name_en: "Ahmed Mohamed",
        date_of_martyrdom: "2024-01-15",
        place_of_martyrdom: "غزة",
        education_level: "university",
        occupation: "طالب",
        bio: "شهيد من غزة"
      },
      {
        id: 2,
        name_ar: "فاطمة علي",
        name_en: "Fatima Ali",
        date_of_martyrdom: "2024-01-20",
        place_of_martyrdom: "القدس",
        education_level: "secondary",
        occupation: "معلمة",
        bio: "شهيدة من القدس"
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 2,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPrevPage: false
    }
  });
});

// API routes
app.use('/api/martyrs', martyrsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/tributes', tributesRoutes);



// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(handleError);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await closePool();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    try {
      await testConnection();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.warn('⚠️  Database connection failed:', dbError.message);
      console.log('📝 Running in development mode without database');
      console.log('💡 To use full features, install MySQL and run: npm run setup');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log('🚀 Martyrs Archive Server running on port', PORT);
      console.log('📊 Environment:', NODE_ENV);
      console.log('🔗 API URL: http://localhost:' + PORT + '/api');
      console.log('🌐 Frontend URL: http://localhost:3000');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
