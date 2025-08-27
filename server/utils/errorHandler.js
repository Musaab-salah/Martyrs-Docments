const fs = require('fs');

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Database error handler
const handleDatabaseError = (error, req, res, next) => {
  console.error('Database error:', error);
  
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ 
      error: 'Duplicate entry', 
      message: 'This record already exists' 
    });
  }
  
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ 
      error: 'Foreign key constraint', 
      message: 'Referenced record does not exist' 
    });
  }
  
  res.status(500).json({ 
    error: 'Database error', 
    message: 'An error occurred while processing your request' 
  });
};

// File error handler
const handleFileError = (error, req, res, next) => {
  console.error('File error:', error);
  
  // Clean up uploaded file if database operation fails
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
  
  res.status(500).json({ 
    error: 'File processing error', 
    message: 'An error occurred while processing the file' 
  });
};

// General error handler
const handleError = (error, req, res, next) => {
  console.error('Error:', error);
  
  // Clean up uploaded file if exists
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

module.exports = {
  catchAsync,
  handleDatabaseError,
  handleFileError,
  handleError
};
