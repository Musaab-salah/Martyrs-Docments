const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'martyrs_archive',
  charset: 'utf8mb4'
};

async function addMartyr20() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Check if martyr with ID 20 already exists
    const [existing] = await connection.execute(
      'SELECT id FROM martyrs WHERE id = ?',
      [20]
    );

    if (existing.length > 0) {
      console.log('⚠️  Martyr with ID 20 already exists');
      return;
    }

    // Insert martyr with ID 20
    const martyrData = {
      id: 20,
      name_ar: 'أحمد علي محمد',
      name_en: 'Ahmed Ali Mohamed',
      date_of_martyrdom: '2024-07-10',
      place_of_martyrdom: JSON.stringify({
        state: 'الخرطوم',
        location: 'أم درمان'
      }),
      education_level: 'خريج',
      university_name: 'جامعة السودان',
      faculty: 'الطب',
      department: 'طب عام',
      occupation: 'طبيب',
      bio: 'كان طبيباً متميزاً في مجال الطب العام. كرس حياته لعلاج المرضى ومساعدة المحتاجين. كان مثالاً للرحمة والإنسانية في مجال الطب.',
      image_url: null,
      approved: true
    };

    const query = `
      INSERT INTO martyrs (
        id, name_ar, name_en, date_of_martyrdom, place_of_martyrdom,
        education_level, university_name, faculty, department,
        occupation, bio, image_url, approved, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      martyrData.id,
      martyrData.name_ar,
      martyrData.name_en,
      martyrData.date_of_martyrdom,
      martyrData.place_of_martyrdom,
      martyrData.education_level,
      martyrData.university_name,
      martyrData.faculty,
      martyrData.department,
      martyrData.occupation,
      martyrData.bio,
      martyrData.image_url,
      martyrData.approved,
      'approved' // Set status to approved
    ];

    await connection.execute(query, values);
    console.log('✅ Martyr with ID 20 added successfully');

    // Verify the insertion
    const [result] = await connection.execute(
      'SELECT id, name_ar, name_en, approved, status FROM martyrs WHERE id = ?',
      [20]
    );

    if (result.length > 0) {
      console.log('✅ Verification successful:');
      console.log(`   ID: ${result[0].id}`);
      console.log(`   Name (Arabic): ${result[0].name_ar}`);
      console.log(`   Name (English): ${result[0].name_en}`);
      console.log(`   Approved: ${result[0].approved ? 'Yes' : 'No'}`);
      console.log(`   Status: ${result[0].status}`);
    }

  } catch (error) {
    console.error('❌ Error adding martyr:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the function
addMartyr20();
