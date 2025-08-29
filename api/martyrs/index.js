const mysql = require('mysql2/promise');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

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

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const connection = await pool.getConnection();

    try {
      // GET request - Get all martyrs
      if (req.method === 'GET') {
        const { 
          page = 1, 
          limit = 10, 
          search = '', 
          place = '', 
          education = '',
          approved = 'true' // Only show approved martyrs by default
        } = req.query;

        const offset = (page - 1) * limit;
        const whereConditions = ['approved = ?'];
        const params = [approved === 'true' ? 1 : 0];

        if (search) {
          whereConditions.push('(name_ar LIKE ? OR name_en LIKE ? OR bio LIKE ?)');
          const searchTerm = `%${search}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }

        if (place) {
          whereConditions.push('place_of_martyrdom LIKE ?');
          params.push(`%${place}%`);
        }

        if (education) {
          whereConditions.push('education_level = ?');
          params.push(education);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const [countResult] = await connection.execute(
          `SELECT COUNT(*) as total FROM martyrs WHERE ${whereClause}`,
          params
        );
        const totalItems = countResult[0].total;

        // Get martyrs with pagination
        const [martyrs] = await connection.execute(
          `SELECT * FROM martyrs WHERE ${whereClause} ORDER BY date_of_martyrdom DESC LIMIT ? OFFSET ?`,
          [...params, parseInt(limit), offset]
        );

        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
          martyrs,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        });
      }

      // POST request - Add new martyr
      else if (req.method === 'POST') {
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

            let photoPath = null;
            if (photo) {
              const filename = `martyr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpeg`;
              photoPath = await processAndSaveImage(photo.buffer, filename);
            }

            // Insert martyr into database
            const [result] = await connection.execute(
              `INSERT INTO martyrs (
                name_ar, name_en, date_of_martyrdom, place_of_martyrdom,
                age, education_level, occupation, bio, photo_path,
                coordinates_lat, coordinates_lng, approved, created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
                martyrData.approved === 'true' ? 1 : 0
              ]
            );

            const [newMartyr] = await connection.execute(
              'SELECT * FROM martyrs WHERE id = ?',
              [result.insertId]
            );

            res.status(201).json({
              message: 'Martyr added successfully',
              martyr: newMartyr[0]
            });
          } catch (error) {
            console.error('Add martyr error:', error);
            res.status(500).json({ error: 'Failed to add martyr' });
          }
        });
      }

      else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Martyrs API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
