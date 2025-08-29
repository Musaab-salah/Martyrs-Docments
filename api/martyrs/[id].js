const mysql = require('mysql2/promise');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'martyrs_archive',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to process and save image
async function processAndSaveImage(buffer, filename) {
  try {
    // Process image with sharp
    const processedImage = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'martyrs');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Save processed image
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, processedImage);

    return `/uploads/martyrs/${filename}`;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}

// Helper function to validate martyr data
function validateMartyrData(data) {
  const errors = [];
  
  if (!data.name_ar || data.name_ar.trim().length < 2) {
    errors.push('Arabic name is required and must be at least 2 characters');
  }
  
  if (!data.name_en || data.name_en.trim().length < 2) {
    errors.push('English name is required and must be at least 2 characters');
  }
  
  if (!data.date_of_martyrdom) {
    errors.push('Date of martyrdom is required');
  }
  
  if (!data.place_of_martyrdom || data.place_of_martyrdom.trim().length < 2) {
    errors.push('Place of martyrdom is required and must be at least 2 characters');
  }
  
  return errors;
}

// Helper function to authenticate admin token
function authenticateToken(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new Error('Access token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Martyr ID is required' });
  }

  try {
    const connection = await pool.getConnection();

    try {
      // GET request - Get specific martyr
      if (req.method === 'GET') {
        const [martyrs] = await connection.execute(
          'SELECT * FROM martyrs WHERE id = ?',
          [id]
        );

        if (martyrs.length === 0) {
          return res.status(404).json({ error: 'Martyr not found' });
        }

        res.status(200).json(martyrs[0]);
      }

      // PUT request - Update martyr (admin only)
      else if (req.method === 'PUT') {
        try {
          authenticateToken(req);
        } catch (authError) {
          return res.status(401).json({ error: authError.message });
        }

        // Handle multipart form data
        const multerUpload = upload.single('photo');
        
        multerUpload(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ error: err.message });
          }

          try {
            const martyrData = req.body;
            const photo = req.file;

            // Validate data
            const validationErrors = validateMartyrData(martyrData);
            if (validationErrors.length > 0) {
              return res.status(400).json({ errors: validationErrors });
            }

            // Check if martyr exists
            const [existing] = await connection.execute(
              'SELECT * FROM martyrs WHERE id = ?',
              [id]
            );

            if (existing.length === 0) {
              return res.status(404).json({ error: 'Martyr not found' });
            }

            let photoPath = existing[0].photo_path;
            if (photo) {
              const filename = `martyr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpeg`;
              photoPath = await processAndSaveImage(photo.buffer, filename);
            }

            // Update martyr in database
            await connection.execute(
              `UPDATE martyrs SET 
                name_ar = ?, name_en = ?, date_of_martyrdom = ?, place_of_martyrdom = ?,
                age = ?, education_level = ?, occupation = ?, bio = ?, photo_path = ?,
                coordinates_lat = ?, coordinates_lng = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
              [
                martyrData.name_ar.trim(),
                martyrData.name_en.trim(),
                martyrData.date_of_martyrdom,
                martyrData.place_of_martyrdom.trim(),
                martyrData.age || null,
                martyrData.education_level || null,
                martyrData.occupation || null,
                martyrData.bio || null,
                photoPath,
                martyrData.coordinates_lat || null,
                martyrData.coordinates_lng || null,
                id
              ]
            );

            const [updatedMartyr] = await connection.execute(
              'SELECT * FROM martyrs WHERE id = ?',
              [id]
            );

            res.status(200).json({
              message: 'Martyr updated successfully',
              martyr: updatedMartyr[0]
            });
          } catch (error) {
            console.error('Update martyr error:', error);
            res.status(500).json({ error: 'Failed to update martyr' });
          }
        });
      }

      // DELETE request - Delete martyr (admin only)
      else if (req.method === 'DELETE') {
        try {
          authenticateToken(req);
        } catch (authError) {
          return res.status(401).json({ error: authError.message });
        }

        // Check if martyr exists
        const [existing] = await connection.execute(
          'SELECT * FROM martyrs WHERE id = ?',
          [id]
        );

        if (existing.length === 0) {
          return res.status(404).json({ error: 'Martyr not found' });
        }

        // Delete martyr
        await connection.execute(
          'DELETE FROM martyrs WHERE id = ?',
          [id]
        );

        res.status(200).json({ message: 'Martyr deleted successfully' });
      }

      // PATCH request - Approve/unapprove martyr (admin only)
      else if (req.method === 'PATCH') {
        try {
          authenticateToken(req);
        } catch (authError) {
          return res.status(401).json({ error: authError.message });
        }

        const { approved } = req.body;

        if (typeof approved !== 'boolean') {
          return res.status(400).json({ error: 'Approved field must be a boolean' });
        }

        // Check if martyr exists
        const [existing] = await connection.execute(
          'SELECT * FROM martyrs WHERE id = ?',
          [id]
        );

        if (existing.length === 0) {
          return res.status(404).json({ error: 'Martyr not found' });
        }

        // Update approval status
        await connection.execute(
          'UPDATE martyrs SET approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [approved ? 1 : 0, id]
        );

        res.status(200).json({ 
          message: `Martyr ${approved ? 'approved' : 'unapproved'} successfully` 
        });
      }

      else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Martyr API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
