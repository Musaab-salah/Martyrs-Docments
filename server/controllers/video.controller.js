const VideoModel = require('../models/video.model');
const { catchAsync } = require('../utils/errorHandler');

class VideoController {
  // Create a new video
  static create = catchAsync(async (req, res) => {
    const { title, youtubeLink } = req.body;

    // Validation
    if (!title || !youtubeLink) {
      return res.status(400).json({
        error: 'Title and YouTube link are required'
      });
    }

    if (title.trim().length < 2) {
      return res.status(400).json({
        error: 'Title must be at least 2 characters long'
      });
    }

    try {
      const videoId = await VideoModel.create({ title, youtubeLink });
      const newVideo = await VideoModel.findById(videoId);

      res.status(201).json({
        message: 'Video created successfully',
        video: newVideo
      });
    } catch (error) {
      if (error.message.includes('Invalid YouTube link')) {
        return res.status(400).json({
          error: 'Please provide a valid YouTube link (e.g., https://www.youtube.com/watch?v=VIDEO_ID)'
        });
      }
      throw error;
    }
  });

  // Get all videos
  static getAll = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const result = await VideoModel.findAll({ page, limit, search });

    res.json({
      message: 'Videos retrieved successfully',
      ...result
    });
  });

  // Get video by ID
  static getById = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'Valid video ID is required'
      });
    }

    const video = await VideoModel.findById(id);

    if (!video) {
      return res.status(404).json({
        error: 'Video not found'
      });
    }

    res.json({
      message: 'Video retrieved successfully',
      video
    });
  });

  // Update video
  static update = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { title, youtubeLink } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'Valid video ID is required'
      });
    }

    // Validation
    if (!title || !youtubeLink) {
      return res.status(400).json({
        error: 'Title and YouTube link are required'
      });
    }

    if (title.trim().length < 2) {
      return res.status(400).json({
        error: 'Title must be at least 2 characters long'
      });
    }

    try {
      const updatedVideo = await VideoModel.update(id, { title, youtubeLink });

      res.json({
        message: 'Video updated successfully',
        video: updatedVideo
      });
    } catch (error) {
      if (error.message.includes('Invalid YouTube link')) {
        return res.status(400).json({
          error: 'Please provide a valid YouTube link (e.g., https://www.youtube.com/watch?v=VIDEO_ID)'
        });
      }
      if (error.message.includes('Video not found')) {
        return res.status(404).json({
          error: 'Video not found'
        });
      }
      throw error;
    }
  });

  // Delete video
  static delete = catchAsync(async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        error: 'Valid video ID is required'
      });
    }

    try {
      await VideoModel.delete(id);

      res.json({
        message: 'Video deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('Video not found')) {
        return res.status(404).json({
          error: 'Video not found'
        });
      }
      throw error;
    }
  });

  // Get recent videos (for homepage)
  static getRecent = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;

    const videos = await VideoModel.getRecent(limit);

    res.json({
      message: 'Recent videos retrieved successfully',
      videos
    });
  });

  // Get video stats
  static getStats = catchAsync(async (req, res) => {
    const result = await VideoModel.findAll({ page: 1, limit: 1 });

    res.json({
      message: 'Video statistics retrieved successfully',
      stats: {
        totalVideos: result.pagination.totalItems
      }
    });
  });
}

module.exports = VideoController;
