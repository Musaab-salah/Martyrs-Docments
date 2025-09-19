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

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE title LIKE ?';
      params.push(`%${search}%`);
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM videos ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    // Get videos with pagination
    const query = `
      SELECT id, title, youtubeLink, createdAt, updatedAt
      FROM videos 
      ${whereClause}
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;

    const [videos] = await pool.execute(query, [...params, limit, offset]);

    return {
      videos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
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
      LIMIT ?
    `;

    try {
      const [videos] = await pool.execute(query, [limit]);
      return videos;
    } catch (error) {
      throw new Error(`Failed to get recent videos: ${error.message}`);
    }
  }
}

module.exports = VideoModel;
