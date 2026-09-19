CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  district TEXT,
  state TEXT,
  students INTEGER DEFAULT 0,
  teachers INTEGER DEFAULT 0,
  green_score NUMERIC(5, 2) DEFAULT 0,
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6)
);

CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  school_id TEXT REFERENCES schools(id),
  teacher_name TEXT,
  students INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'organizer')),
  school_id TEXT REFERENCES schools(id),
  class_id TEXT REFERENCES classes(id),
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  difficulty TEXT,
  lessons INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  topic TEXT,
  difficulty TEXT,
  points INTEGER DEFAULT 0,
  verification_required BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES users(id),
  student_name TEXT NOT NULL,
  mission_id TEXT REFERENCES missions(id),
  mission_title TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  ai_confidence INTEGER DEFAULT 0,
  ai_verified BOOLEAN DEFAULT false,
  teacher_approval TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'awaiting_approval',
  points_awarded INTEGER DEFAULT 0,
  detected_items JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS competitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming',
  schools INTEGER DEFAULT 0,
  students INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  missions INTEGER DEFAULT 0,
  description TEXT
);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  unlocked BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL,
  syllabus TEXT,
  env_topic TEXT,
  task TEXT NOT NULL,
  deadline DATE,
  points INTEGER DEFAULT 100,
  difficulty TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'assigned',
  students INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS class_analytics (
  class_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  topic_avg_scores JSONB DEFAULT '[]'::jsonb,
  participation_trend JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS student_topic_progress (
  student_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  completed_lessons INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, topic_id)
);

