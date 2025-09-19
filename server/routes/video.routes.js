const express = require('express');
const router = express.Router();
const VideoController = require('../controllers/video.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Validation middleware for video creation/update
const videoValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Title must be between 2 and 255 characters'),
  body('youtubeLink')
    .trim()
    .matches(/^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/)
    .withMessage('Please provide a valid YouTube link')
];

// Public routes
// GET /api/videos - Get all videos (public access)
router.get('/', VideoController.getAll);

// GET /api/videos/recent - Get recent videos for homepage
router.get('/recent', VideoController.getRecent);

// GET /api/videos/stats - Get video statistics
router.get('/stats', VideoController.getStats);

// GET /api/videos/:id - Get specific video
router.get('/:id', VideoController.getById);

// Admin routes (require authentication)
// POST /api/videos - Create new video
router.post('/',
  authenticateToken,
  requireAdmin,
  videoValidation,
  handleValidationErrors,
  VideoController.create
);

// PUT /api/videos/:id - Update video
router.put('/:id',
  authenticateToken,
  requireAdmin,
  videoValidation,
  handleValidationErrors,
  VideoController.update
);

// DELETE /api/videos/:id - Delete video
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  VideoController.delete
);

module.exports = router;
