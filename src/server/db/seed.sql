INSERT INTO schools (id, name, location, district, state, students, teachers, green_score, lat, lng) VALUES
  ('s1', 'Green Valley School', 'Hyderabad', 'Rangareddy', 'Telangana', 480, 32, 89.5, 17.385, 78.4867),
  ('s2', 'Sunrise Academy', 'Bangalore', 'Bangalore Urban', 'Karnataka', 620, 45, 85.2, 12.9716, 77.5946),
  ('s3', 'ABC Public School', 'Chennai', 'Chennai', 'Tamil Nadu', 390, 28, 78.8, 13.0827, 80.2707)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  state = EXCLUDED.state,
  students = EXCLUDED.students,
  teachers = EXCLUDED.teachers,
  green_score = EXCLUDED.green_score;

INSERT INTO classes (id, name, school_id, teacher_name, students) VALUES
  ('c1', '8-A', 's1', 'Dr. Meera Reddy', 40),
  ('c2', '8-B', 's1', 'Mr. Rajesh Kumar', 38),
  ('c3', '9-A', 's2', 'Ms. Kavitha Nair', 42)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  school_id = EXCLUDED.school_id,
  teacher_name = EXCLUDED.teacher_name,
  students = EXCLUDED.students;

INSERT INTO users (id, name, email, password, role, school_id, class_id, points, streak, level, badges) VALUES
  ('u1', 'Ananya Sharma', 'ananya@student.eco', '$2b$10$mockhashedpassword', 'student', 's1', 'c1', 2450, 5, 12, 12),
  ('u2', 'Aarav Patel', 'aarav@student.eco', '$2b$10$mockhashedpassword', 'student', 's1', 'c1', 2850, 7, 14, 15),
  ('u6', 'Meghna Rao', 'meghna@student.eco', '$2b$10$mockhashedpassword', 'student', 's1', 'c1', 2680, 6, 13, 14),
  ('t1', 'Dr. Meera Reddy', 'meera@teacher.eco', '$2b$10$mockhashedpassword', 'teacher', 's1', 'c1', 0, 0, 1, 0),
  ('o1', 'Mrs. Lakshmi Menon', 'lakshmi@organizer.eco', '$2b$10$mockhashedpassword', 'organizer', NULL, NULL, 0, 0, 1, 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  school_id = EXCLUDED.school_id,
  class_id = EXCLUDED.class_id,
  points = EXCLUDED.points,
  streak = EXCLUDED.streak,
  level = EXCLUDED.level,
  badges = EXCLUDED.badges;

INSERT INTO topics (id, name, difficulty, lessons) VALUES
  ('tp1', 'Climate Change', 'Intermediate', 10),
  ('tp2', 'Waste Management', 'Beginner', 8),
  ('tp3', 'Water Conservation', 'Intermediate', 8)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  difficulty = EXCLUDED.difficulty,
  lessons = EXCLUDED.lessons;

INSERT INTO missions (id, title, topic, difficulty, points, verification_required) VALUES
  ('m1', 'Plastic-Free Week', 'Waste Management', 'Medium', 100, true),
  ('m2', 'Water Saver', 'Water Conservation', 'Easy', 75, true),
  ('m5', 'Plant a Tree', 'Biodiversity', 'Hard', 200, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  topic = EXCLUDED.topic,
  difficulty = EXCLUDED.difficulty,
  points = EXCLUDED.points,
  verification_required = EXCLUDED.verification_required;

INSERT INTO submissions (id, student_id, student_name, mission_id, mission_title, image_url, location, timestamp, ai_confidence, ai_verified, teacher_approval, status, points_awarded, detected_items) VALUES
  ('sub1', 'u1', 'Ananya Sharma', 'm5', 'Plant a Tree', '/placeholder-tree.jpg', 'Green Valley School', now(), 94, true, 'pending', 'awaiting_approval', 0, '["Tree sapling", "Soil", "Gardening tools"]'),
  ('sub2', 'u2', 'Aarav Patel', 'm2', 'Water Saver', '/placeholder-water.jpg', 'Sunrise Academy', now(), 75, true, 'pending', 'awaiting_approval', 0, '["Water meter", "Low-flow faucet"]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO competitions (id, name, status, schools, students, start_date, end_date, missions, description) VALUES
  ('comp1', 'Inter-School Green Challenge 2026', 'upcoming', 84, 12400, '2026-09-01', '2026-09-30', 15, 'Compete with schools across the state for the greenest campus award'),
  ('comp3', 'Clean City Initiative', 'active', 45, 8900, '2026-08-01', '2026-08-31', 10, 'Community clean-up challenge across participating schools')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  schools = EXCLUDED.schools,
  students = EXCLUDED.students;

INSERT INTO badges (id, name, icon, unlocked) VALUES
  ('b1', 'Eco Starter', '🌱', true),
  ('b2', 'Waste Warrior', '♻️', true),
  ('b7', 'Eco Master', '🏆', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  unlocked = EXCLUDED.unlocked;

INSERT INTO tasks (id, class_id, syllabus, env_topic, task, deadline, points, difficulty, status, students, completed) VALUES
  ('t1', '8-A', 'Water Resources', 'Water Conservation', 'Water Conservation Scenario Quiz', '2026-08-25', 100, 'Medium', 'assigned', 40, 12),
  ('t2', '8-A', 'Natural Vegetation', 'Biodiversity', 'Biodiversity Explorer Mission', '2026-08-28', 150, 'Medium', 'in_progress', 40, 28),
  ('t3', '8-B', 'Minerals', 'Renewable Energy', 'Energy Audit Assignment', '2026-08-22', 120, 'Hard', 'overdue', 38, 15),
  ('t4', '8-A', 'Pollution', 'Waste Management', 'Waste Segregation Challenge', '2026-08-20', 80, 'Easy', 'completed', 40, 40)
ON CONFLICT (id) DO NOTHING;

INSERT INTO class_analytics (class_id, name, topic_avg_scores, participation_trend) VALUES
  ('c1', 'Class 8-A', '[{"topic":"Climate Change","avg_score":68},{"topic":"Waste Management","avg_score":82},{"topic":"Water Conservation","avg_score":55}]', '[{"week":"Week 1","active_students":28},{"week":"Week 2","active_students":31},{"week":"Week 3","active_students":27}]'),
  ('c2', 'Class 8-B', '[{"topic":"Climate Change","avg_score":48},{"topic":"Waste Management","avg_score":75},{"topic":"Water Conservation","avg_score":88}]', '[{"week":"Week 1","active_students":20},{"week":"Week 2","active_students":24},{"week":"Week 3","active_students":30}]'),
  ('c3', 'Class 9-A', '[{"topic":"Climate Change","avg_score":92},{"topic":"Waste Management","avg_score":61},{"topic":"Water Conservation","avg_score":74}]', '[{"week":"Week 1","active_students":35},{"week":"Week 2","active_students":36},{"week":"Week 3","active_students":38}]')
ON CONFLICT (class_id) DO UPDATE SET
  name = EXCLUDED.name,
  topic_avg_scores = EXCLUDED.topic_avg_scores,
  participation_trend = EXCLUDED.participation_trend;
