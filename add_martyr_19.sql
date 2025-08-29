-- Add martyr with ID 19 to the database
USE martyrs_archive;

-- Insert a new martyr with ID 19
INSERT INTO martyrs (
  id,
  name_ar, 
  name_en, 
  date_of_martyrdom, 
  place_of_martyrdom, 
  education_level, 
  university_name, 
  faculty, 
  department,
  occupation, 
  bio, 
  image_url, 
  approved
) VALUES (
  19,
  'عبدالله محمد أحمد',
  'Abdullah Mohamed Ahmed',
  '2024-06-15',
  '{"state": "الخرطوم", "location": "الخرطوم بحري"}',
  'جامعي',
  'جامعة الخرطوم',
  'الهندسة',
  'كهربائية',
  'مهندس كهربائي',
  'كان مهندساً متميزاً في مجال الهندسة الكهربائية. عمل على مشاريع مهمة لتطوير البنية التحتية الكهربائية في السودان. كان مثالاً للكفاءة والإخلاص في العمل.',
  NULL,
  TRUE
);

-- Verify the insertion
SELECT * FROM martyrs WHERE id = 19;
