-- Martyrs Archive Database Initialization Script
-- This script creates the database structure and initial data

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS martyrs_archive
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE martyrs_archive;

-- Create tables (these will be created by the application, but included for reference)
-- The application will handle table creation automatically

-- Insert default super admin account
-- Password: admin123 (hashed with bcrypt)
INSERT INTO admins (username, email, password_hash, role, is_active) 
VALUES (
    'admin',
    'admin@martyrsarchive.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', -- admin123
    'super_admin',
    TRUE
) ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    is_active = TRUE;

-- Insert sample martyrs (for testing purposes)
INSERT INTO martyrs (full_name, place_of_martyrdom, date_of_martyrdom, age, biography, education, occupation, role) VALUES
('Ahmad Al-Masri', 'Gaza City', '2023-10-15', 25, 'Ahmad was a dedicated teacher who believed in the power of education to change lives. He taught mathematics at a local school and was known for his patience and kindness towards his students.', 'Bachelor of Mathematics', 'Teacher', 'Educator'),
('Fatima Al-Zahra', 'Rafah', '2023-11-20', 32, 'Fatima was a nurse who dedicated her life to helping others. She worked at the local hospital and was known for her compassion and dedication to her patients.', 'Nursing Degree', 'Nurse', 'Healthcare Worker'),
('Omar Al-Hassan', 'Khan Yunis', '2023-12-05', 28, 'Omar was a civil engineer who worked on infrastructure projects to improve his community. He was passionate about building a better future for his people.', 'Civil Engineering Degree', 'Engineer', 'Infrastructure Developer'),
('Layla Al-Rashid', 'Beit Lahia', '2024-01-10', 19, 'Layla was a student studying medicine. She had dreams of becoming a doctor to help her community. She was known for her intelligence and determination.', 'Medical Student', 'Student', 'Future Doctor'),
('Yusuf Al-Nasser', 'Jabalia', '2024-02-15', 45, 'Yusuf was a farmer who provided food for his family and community. He was known for his hard work and generosity in sharing his harvest with those in need.', 'High School Education', 'Farmer', 'Food Provider'),
('Aisha Al-Mahmoud', 'Deir Al-Balah', '2024-03-01', 35, 'Aisha was a social worker who helped families in need. She was known for her empathy and dedication to improving the lives of others.', 'Social Work Degree', 'Social Worker', 'Community Helper'),
('Khalil Al-Omar', 'Beit Hanoun', '2024-03-20', 29, 'Khalil was a journalist who reported on the truth and documented the struggles of his people. He was committed to telling stories that needed to be heard.', 'Journalism Degree', 'Journalist', 'Truth Seeker'),
('Nour Al-Sabah', 'Al-Qarara', '2024-04-05', 22, 'Nour was an artist who used her creativity to express the beauty and pain of her homeland. Her paintings captured the spirit of resilience.', 'Fine Arts Degree', 'Artist', 'Cultural Expressionist'),
('Mahmoud Al-Rahman', 'Abu Salim', '2024-04-25', 38, 'Mahmoud was a carpenter who built furniture and homes for families. He was known for his craftsmanship and willingness to help others.', 'Vocational Training', 'Carpenter', 'Builder'),
('Samira Al-Hakim', 'Al-Maghazi', '2024-05-10', 27, 'Samira was a pharmacist who provided essential medicines to her community. She was known for her knowledge and dedication to public health.', 'Pharmacy Degree', 'Pharmacist', 'Healthcare Provider');

-- Insert sample tributes (for testing purposes)
INSERT INTO tributes (martyr_id, visitor_name, message, is_approved, ip_address) VALUES
(1, 'Ahmed', 'Ahmad was my teacher. He taught me not just mathematics, but also about life and perseverance. I will never forget his kindness.', TRUE, '192.168.1.1'),
(1, 'Mariam', 'Thank you for being such an inspiring teacher. Your lessons will live on in the hearts of your students.', TRUE, '192.168.1.2'),
(2, 'Dr. Hassan', 'Fatima was an exceptional nurse. Her dedication to her patients was unmatched. She will be deeply missed.', TRUE, '192.168.1.3'),
(3, 'Community Member', 'Omar''s work on our infrastructure projects made a real difference in our lives. He was a true community leader.', TRUE, '192.168.1.4'),
(4, 'Classmate', 'Layla was the brightest student in our class. She had so much potential and was always helping others with their studies.', TRUE, '192.168.1.5'),
(5, 'Neighbor', 'Yusuf was a generous man who always shared his harvest with those in need. His kindness touched many lives.', TRUE, '192.168.1.6'),
(6, 'Client', 'Aisha helped my family through difficult times. Her compassion and support meant everything to us.', TRUE, '192.168.1.7'),
(7, 'Colleague', 'Khalil was a brave journalist who always told the truth, no matter the cost. His reporting made a difference.', TRUE, '192.168.1.8'),
(8, 'Art Lover', 'Nour''s paintings captured the beauty and resilience of our people. Her art will continue to inspire future generations.', TRUE, '192.168.1.9'),
(9, 'Customer', 'Mahmoud built beautiful furniture for my family. His craftsmanship and honesty were exceptional.', TRUE, '192.168.1.10'),
(10, 'Patient', 'Samira always took the time to explain my medications and ensure I understood how to take them properly. She was truly caring.', TRUE, '192.168.1.11');

-- Insert sample media gallery items
INSERT INTO media_gallery (title, description, file_url, file_type, category, is_public) VALUES
('Memorial Service', 'Community gathering to honor our martyrs', '/uploads/media/memorial-service.jpg', 'image', 'events', TRUE),
('Community Support', 'People coming together to support families', '/uploads/media/community-support.jpg', 'image', 'events', TRUE),
('Educational Program', 'Program to educate about our martyrs', '/uploads/media/education-program.jpg', 'image', 'education', TRUE),
('Historical Document', 'Important historical document about martyrs', '/uploads/documents/historical-doc.pdf', 'document', 'documents', TRUE),
('Memorial Video', 'Video tribute to our martyrs', '/uploads/media/memorial-video.mp4', 'video', 'tributes', TRUE);

-- Insert sample statistics
INSERT INTO statistics (stat_type, stat_value) VALUES
('total_martyrs', '{"count": 10, "last_updated": "2024-01-01T00:00:00Z"}'),
('martyrs_by_year', '{"2023": 3, "2024": 7, "last_updated": "2024-01-01T00:00:00Z"}'),
('martyrs_by_location', '{"Gaza City": 1, "Rafah": 1, "Khan Yunis": 1, "Beit Lahia": 1, "Jabalia": 1, "Deir Al-Balah": 1, "Beit Hanoun": 1, "Al-Qarara": 1, "Abu Salim": 1, "Al-Maghazi": 1, "last_updated": "2024-01-01T00:00:00Z"}'),
('age_distribution', '{"0-17": 0, "18-30": 4, "31-50": 5, "51+": 1, "last_updated": "2024-01-01T00:00:00Z"}'),
('total_tributes', '{"count": 11, "approved": 11, "pending": 0, "last_updated": "2024-01-01T00:00:00Z"}');

-- Display initialization summary
SELECT 'Database initialization completed successfully!' as status;
SELECT COUNT(*) as total_martyrs FROM martyrs;
SELECT COUNT(*) as total_tributes FROM tributes;
SELECT COUNT(*) as total_admins FROM admins;
SELECT COUNT(*) as total_media FROM media_gallery;
