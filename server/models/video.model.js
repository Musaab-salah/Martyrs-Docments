const { pool } = require('../config/database');

class VideoModel {

  // Create a new video
  static async create(videoData) {
    const { title, youtubeLink } = videoData;
    
    // Validate YouTube link format
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(youtubeLink)) {
      throw new Error('Invalid YouTube link format');
    }

    const query = `
      INSERT INTO videos (title, youtubeLink)
      VALUES (?, ?)
    `;

    try {
      const [result] = await pool.execute(query, [title.trim(), youtubeLink.trim()]);
      return result.insertId;
    } catch (error) {
      throw new Error(`Failed to create video: ${error.message}`);
    }
  }

  // Get all videos
  static async findAll(options = {}) {
    const { page = 1, limit = 20, search = '' } = options;
    const offset = (page - 1) * limit;

    try {
      let whereClause = '';
      let params = [];

      if (search && search.trim()) {
        whereClause = 'WHERE title LIKE ?';
        params.push(`%${search.trim()}%`);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM videos ${whereClause}`;
      const [countResult] = await pool.execute(countQuery, params);
      const total = countResult[0].total;

      // Get videos with pagination using separate queries to avoid parameter binding issues
      let videosQuery;
      let videosParams;

      if (search && search.trim()) {
        videosQuery = `
          SELECT id, title, youtubeLink, createdAt, updatedAt
          FROM videos
          WHERE title LIKE ?
          ORDER BY createdAt DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
        videosParams = [`%${search.trim()}%`];
      } else {
        videosQuery = `
          SELECT id, title, youtubeLink, createdAt, updatedAt
          FROM videos
          ORDER BY createdAt DESC
          LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
        `;
        videosParams = [];
      }

      const [videos] = await pool.execute(videosQuery, videosParams);

      return {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get videos: ${error.message}`);
    }
  }

  // Get video by ID
  static async findById(id) {
    const query = `
      SELECT id, title, youtubeLink, createdAt, updatedAt
      FROM videos 
      WHERE id = ?
    `;

    try {
      const [videos] = await pool.execute(query, [id]);
      return videos[0] || null;
    } catch (error) {
      throw new Error(`Failed to find video: ${error.message}`);
    }
  }

  // Update video
  static async update(id, videoData) {
    const { title, youtubeLink } = videoData;

    // Validate YouTube link format
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(youtubeLink)) {
      throw new Error('Invalid YouTube link format');
    }

    const query = `
      UPDATE videos 
      SET title = ?, youtubeLink = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    try {
      const [result] = await pool.execute(query, [title.trim(), youtubeLink.trim(), id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Video not found');
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }
  }

  // Delete video
  static async delete(id) {
    const query = 'DELETE FROM videos WHERE id = ?';

    try {
      const [result] = await pool.execute(query, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Video not found');
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }

  // Get recent videos (for homepage)
  static async getRecent(limit = 6) {
    const query = `
      SELECT id, title, youtubeLink, createdAt
      FROM videos
      ORDER BY createdAt DESC
      LIMIT ${parseInt(limit)}
    `;

    try {
      const [videos] = await pool.execute(query, []);
      return videos;
    } catch (error) {
      throw new Error(`Failed to get recent videos: ${error.message}`);
    }
  }
}

module.exports = VideoModel;
