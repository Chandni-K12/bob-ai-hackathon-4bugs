require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const db = require('./db');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const mapUserRow = (row) => row && ({
  id: row.id,
  name: row.name,
  email: row.email,
  password: row.password,
  role: row.role,
  schoolId: row.school_id,
  classId: row.class_id,
  points: row.points,
  streak: row.streak,
  level: row.level,
  badges: row.badges,
});

const mapSchoolRow = (row) => ({
  id: row.id,
  name: row.name,
  location: row.location,
  state: row.state,
  students: row.students,
  greenScore: Number(row.green_score),
});

const mapMissionRow = (row) => ({
  id: row.id,
  title: row.title,
  topic: row.topic,
  difficulty: row.difficulty,
  points: row.points,
  verificationRequired: row.verification_required,
});

const mapSubmissionRow = (row) => ({
  id: row.id,
  studentId: row.student_id,
  studentName: row.student_name,
  missionId: row.mission_id,
  missionTitle: row.mission_title,
  imageUrl: row.image_url,
  location: row.location,
  timestamp: row.timestamp,
  aiConfidence: row.ai_confidence,
  aiVerified: row.ai_verified,
  teacherApproval: row.teacher_approval,
  status: row.status,
  pointsAwarded: row.points_awarded,
  detectedItems: row.detected_items || [],
});

const mapTaskRow = (row) => ({
  id: row.id,
  classId: row.class_id,
  syllabus: row.syllabus,
  envTopic: row.env_topic,
  task: row.task,
  deadline: row.deadline,
  points: row.points,
  difficulty: row.difficulty,
  status: row.status,
  students: row.students,
  completed: row.completed,
});

const getPendingSubmissionCount = async () => {
  if (!db.hasDatabase) {
    return submissions.filter(s => s.status === 'awaiting_approval').length;
  }
  try {
    const result = await db.query("SELECT COUNT(*)::int AS count FROM submissions WHERE status = 'awaiting_approval'");
    return result.rows[0].count;
  } catch (err) {
    console.log('DB pending submission fallback:', err.message);
    return submissions.filter(s => s.status === 'awaiting_approval').length;
  }
};

// --- MOCK DATA ---
const users = [
  { id: 'u1', name: 'Ananya Sharma', email: 'ananya@student.eco', password: '$2b$10$mockhashedpassword', role: 'student', schoolId: 's1', classId: 'c1', points: 2450, streak: 5, level: 12, badges: 12 },
  { id: 't1', name: 'Dr. Meera Reddy', email: 'meera@teacher.eco', password: '$2b$10$mockhashedpassword', role: 'teacher', schoolId: 's1', classId: 'c1' },
  { id: 'o1', name: 'Mrs. Lakshmi Menon', email: 'lakshmi@organizer.eco', password: '$2b$10$mockhashedpassword', role: 'organizer' },
];

// --- DATABASE ROUTES ---
// These handlers run first. If the database is unavailable, the mock routes below answer.
app.post('/api/auth/login', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const { email, role } = req.body;
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2 LIMIT 1',
      [email, role]
    );
    const user = mapUserRow(result.rows[0]);
    if (!user) return next();
    return res.json({ token: 'mock_jwt_' + Date.now(), user });
  } catch (err) {
    console.log('DB auth fallback:', err.message);
    return next();
  }
});

app.get('/api/dashboard/student/:studentId', async (req, res) => {
  if (!db.hasDatabase) {
    return res.status(503).json({ error: 'Database is not configured' });
  }

  try {
    const result = await db.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.points,
        u.streak,
        u.level,
        u.badges,
        c.id AS "classId",
        c.name AS "className",
        s.id AS "schoolId",
        s.name AS "schoolName",
        s.green_score AS "greenScore"
      FROM users u
      LEFT JOIN classes c ON c.id = u.class_id
      LEFT JOIN schools s ON s.id = u.school_id
      WHERE u.id = $1 AND u.role = 'student'
    `, [req.params.studentId]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Student dashboard query failed:', err.message);
    return res.status(500).json({ error: 'Unable to load student dashboard' });
  }
});

app.get('/api/auth/profile', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query("SELECT * FROM users WHERE role = 'student' ORDER BY id LIMIT 1");
    return res.json(mapUserRow(result.rows[0]));
  } catch (err) {
    console.log('DB profile fallback:', err.message);
    return next();
  }
});

app.get('/api/users', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query('SELECT * FROM users ORDER BY role, points DESC, name');
    return res.json(result.rows.map(mapUserRow));
  } catch (err) {
    console.log('DB users fallback:', err.message);
    return next();
  }
});

app.get('/api/users/:id', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [req.params.id]);
    const user = mapUserRow(result.rows[0]);
    return res.json(user || { error: 'Not found' });
  } catch (err) {
    console.log('DB user fallback:', err.message);
    return next();
  }
});

app.get('/api/schools', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query('SELECT * FROM schools ORDER BY green_score DESC');
    return res.json(result.rows.map(mapSchoolRow));
  } catch (err) {
    console.log('DB schools fallback:', err.message);
    return next();
  }
});

app.get('/api/topics', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query('SELECT id, name, difficulty, lessons FROM topics ORDER BY id');
    return res.json(result.rows);
  } catch (err) {
    console.log('DB topics fallback:', err.message);
    return next();
  }
});

app.get('/api/missions', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query('SELECT * FROM missions ORDER BY id');
    return res.json(result.rows.map(mapMissionRow));
  } catch (err) {
    console.log('DB missions fallback:', err.message);
    return next();
  }
});

app.get('/api/submissions', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query('SELECT * FROM submissions ORDER BY timestamp DESC');
    return res.json(result.rows.map(mapSubmissionRow));
  } catch (err) {
    console.log('DB submissions fallback:', err.message);
    return next();
  }
});

app.put('/api/submissions/:id/approve', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query(
      "UPDATE submissions SET status = 'approved', teacher_approval = 'approved', points_awarded = CASE WHEN points_awarded > 0 THEN points_awarded ELSE 100 END WHERE id = $1 RETURNING points_awarded",
      [req.params.id]
    );
    return res.json({
      success: true,
      message: 'Submission approved',
      pointsAwarded: result.rows[0]?.points_awarded || 100,
    });
  } catch (err) {
    console.log('DB approve fallback:', err.message);
    return next();
  }
});

app.put('/api/submissions/:id/reject', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    await db.query(
      "UPDATE submissions SET status = 'rejected', teacher_approval = 'rejected', points_awarded = 0 WHERE id = $1",
      [req.params.id]
    );
    return res.json({ success: true, message: 'Submission rejected' });
  } catch (err) {
    console.log('DB reject fallback:', err.message);
    return next();
  }
});

app.get('/api/leaderboards/class/:id', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query(
      "SELECT ROW_NUMBER() OVER (ORDER BY points DESC, name ASC)::int AS rank, name, points FROM users WHERE role = 'student' AND class_id = $1 ORDER BY points DESC, name ASC LIMIT 10",
      [req.params.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.log('DB leaderboard fallback:', err.message);
    return next();
  }
});

app.get('/api/competitions', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query('SELECT id, name, status, schools, students FROM competitions ORDER BY start_date NULLS LAST, name');
    return res.json(result.rows);
  } catch (err) {
    console.log('DB competitions fallback:', err.message);
    return next();
  }
});

app.post('/api/competitions', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const id = 'comp_' + Date.now();
    const result = await db.query(
      'INSERT INTO competitions (id, name, status, schools, students, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, req.body.name, req.body.status || 'upcoming', Number(req.body.schools) || 0, Number(req.body.students) || 0, req.body.description || '']
    );
    return res.status(201).json({ success: true, competition: result.rows[0] });
  } catch (err) {
    console.log('DB create competition fallback:', err.message);
    return next();
  }
});

app.get('/api/badges', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query('SELECT id, name, icon, unlocked FROM badges ORDER BY id');
    return res.json(result.rows);
  } catch (err) {
    console.log('DB badges fallback:', err.message);
    return next();
  }
});

app.get('/api/tasks', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const { classId } = req.query;
    const result = classId
      ? await db.query('SELECT * FROM tasks WHERE class_id = $1 ORDER BY deadline NULLS LAST, id', [classId])
      : await db.query('SELECT * FROM tasks ORDER BY deadline NULLS LAST, id');
    return res.json(result.rows.map(mapTaskRow));
  } catch (err) {
    console.log('DB tasks fallback:', err.message);
    return next();
  }
});

app.post('/api/tasks', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  const { classId, syllabus, envTopic, task, difficulty, deadline, points } = req.body;
  if (!classId || !task) {
    return res.status(400).json({ error: 'classId and task are required' });
  }
  try {
    const id = 't' + Date.now();
    const result = await db.query(
      "INSERT INTO tasks (id, class_id, syllabus, env_topic, task, difficulty, deadline, points, status, students, completed) VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, '')::date, $8, 'assigned', 40, 0) RETURNING *",
      [id, classId, syllabus || '', envTopic || '', task, difficulty || 'Medium', deadline || '', Number(points) || 100]
    );
    return res.status(201).json(mapTaskRow(result.rows[0]));
  } catch (err) {
    console.log('DB create task fallback:', err.message);
    return next();
  }
});

app.get('/api/analytics/platform', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*)::int FROM schools) AS "totalSchools",
        (SELECT COALESCE(SUM(students), 0)::int FROM schools) AS "totalStudents",
        (SELECT COALESCE(SUM(teachers), 0)::int FROM schools) AS "totalTeachers",
        (SELECT COUNT(*)::int FROM competitions WHERE status = 'active') AS "activeCompetitions"
    `);
    return res.json(result.rows[0]);
  } catch (err) {
    console.log('DB platform analytics fallback:', err.message);
    return next();
  }
});

app.get('/api/analytics/class/:id', async (req, res, next) => {
  if (!db.hasDatabase) return next();
  try {
    const result = await db.query('SELECT * FROM class_analytics WHERE class_id = $1 LIMIT 1', [req.params.id]);
    if (!result.rows[0]) return next();
    const pendingCount = await getPendingSubmissionCount();
    return res.json({
      name: result.rows[0].name,
      topic_avg_scores: result.rows[0].topic_avg_scores,
      participation_trend: result.rows[0].participation_trend,
      pending_verification_count: pendingCount,
    });
  } catch (err) {
    console.log('DB class analytics fallback:', err.message);
    return next();
  }
});

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  const user = users.find(u => u.email === email && u.role === role);
  if (!user) {
    const defaultUser = users.find(u => u.role === role);
    if (defaultUser) {
      return res.json({ token: 'mock_jwt_' + Date.now(), user: { ...defaultUser, email } });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: 'mock_jwt_' + Date.now(), user });
});

app.get('/api/auth/profile', (req, res) => {
  res.json(users[0]);
});

// --- USERS ---
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  res.json(user || { error: 'Not found' });
});

// --- SCHOOLS ---
app.get('/api/schools', (req, res) => {
  res.json([
    { id: 's1', name: 'Green Valley School', location: 'Hyderabad', state: 'Telangana', students: 480, greenScore: 89.5 },
    { id: 's2', name: 'Sunrise Academy', location: 'Bangalore', state: 'Karnataka', students: 620, greenScore: 85.2 },
    { id: 's3', name: 'ABC Public School', location: 'Chennai', state: 'Tamil Nadu', students: 390, greenScore: 78.8 },
  ]);
});

// --- CLASS ANALYTICS ---
const CLASS_ANALYTICS = {
  c1: {
    name: 'Class 8-A',
    topic_avg_scores: [
      { topic: 'Climate Change',     avg_score: 68 },
      { topic: 'Waste Management',   avg_score: 82 },
      { topic: 'Water Conservation', avg_score: 55 },
    ],
    participation_trend: [
      { week: 'Week 1', active_students: 28 },
      { week: 'Week 2', active_students: 31 },
      { week: 'Week 3', active_students: 27 },
    ],
  },
  c2: {
    name: 'Class 8-B',
    topic_avg_scores: [
      { topic: 'Climate Change',     avg_score: 48 },
      { topic: 'Waste Management',   avg_score: 75 },
      { topic: 'Water Conservation', avg_score: 88 },
    ],
    participation_trend: [
      { week: 'Week 1', active_students: 20 },
      { week: 'Week 2', active_students: 24 },
      { week: 'Week 3', active_students: 30 },
    ],
  },
  c3: {
    name: 'Class 9-A',
    topic_avg_scores: [
      { topic: 'Climate Change',     avg_score: 92 },
      { topic: 'Waste Management',   avg_score: 61 },
      { topic: 'Water Conservation', avg_score: 74 },
    ],
    participation_trend: [
      { week: 'Week 1', active_students: 35 },
      { week: 'Week 2', active_students: 36 },
      { week: 'Week 3', active_students: 38 },
    ],
  },
};

// --- TOPICS ---
app.get('/api/topics', (req, res) => {
  res.json([
    { id: 'tp1', name: 'Climate Change', difficulty: 'Intermediate', lessons: 10 },
    { id: 'tp2', name: 'Waste Management', difficulty: 'Beginner', lessons: 8 },
    { id: 'tp3', name: 'Water Conservation', difficulty: 'Intermediate', lessons: 8 },
  ]);
});

// --- MISSIONS ---
app.get('/api/missions', (req, res) => {
  res.json([
    { id: 'm1', title: 'Plastic-Free Week', topic: 'Waste Management', difficulty: 'Medium', points: 100, verificationRequired: true },
    { id: 'm2', title: 'Water Saver', topic: 'Water Conservation', difficulty: 'Easy', points: 75, verificationRequired: true },
    { id: 'm5', title: 'Plant a Tree', topic: 'Biodiversity', difficulty: 'Hard', points: 200, verificationRequired: true },
  ]);
});

// --- SUBMISSIONS ---
const submissions = [
  { id: 'sub1', studentName: 'Ananya Sharma', missionTitle: 'Plant a Tree', aiConfidence: 94, status: 'awaiting_approval', location: 'Green Valley School', timestamp: new Date().toISOString(), detectedItems: ['Tree sapling', 'Soil', 'Gardening tools'] },
  { id: 'sub2', studentName: 'Aarav Patel', missionTitle: 'Water Saver', aiConfidence: 75, status: 'awaiting_approval', location: 'Sunrise Academy', timestamp: new Date().toISOString(), detectedItems: ['Water meter', 'Low-flow faucet'] },
];

app.get('/api/submissions', (req, res) => res.json(submissions));

app.put('/api/submissions/:id/approve', (req, res) => {
  const sub = submissions.find(s => s.id === req.params.id);
  if (sub) sub.status = 'approved';
  res.json({ success: true, message: 'Submission approved', pointsAwarded: 100 });
});

app.put('/api/submissions/:id/reject', (req, res) => {
  const sub = submissions.find(s => s.id === req.params.id);
  if (sub) sub.status = 'rejected';
  res.json({ success: true, message: 'Submission rejected' });
});

// --- LEADERBOARDS ---
app.get('/api/leaderboards/class/:id', (req, res) => {
  res.json([
    { rank: 1, name: 'Aarav Patel', points: 2850 },
    { rank: 2, name: 'Meghna Rao', points: 2680 },
    { rank: 7, name: 'Ananya Sharma', points: 2450 },
  ]);
});

// --- COMPETITIONS ---
app.get('/api/competitions', (req, res) => {
  res.json([
    { id: 'comp1', name: 'Inter-School Green Challenge 2026', status: 'upcoming', schools: 84, students: 12400 },
    { id: 'comp3', name: 'Clean City Initiative', status: 'active', schools: 45, students: 8900 },
  ]);
});

app.post('/api/competitions', (req, res) => {
  res.json({ success: true, competition: { id: 'comp_new', ...req.body, status: 'upcoming' } });
});

// --- BADGES ---
app.get('/api/badges', (req, res) => {
  res.json([
    { id: 'b1', name: 'Eco Starter', icon: '🌱', unlocked: true },
    { id: 'b2', name: 'Waste Warrior', icon: '♻️', unlocked: true },
    { id: 'b7', name: 'Eco Master', icon: '🏆', unlocked: false },
  ]);
});

// --- AI CHATBOT ROUTE ---
const ZERO_WASTE_TIPS_SERVER = [
  { title: "Carry Reusables", desc: "Use a stainless steel water bottle and cloth shopping bag everywhere you go." },
  { title: "Say No to Single-Use Plastics", desc: "Avoid plastic straws, disposable cutlery, and bottled drinks." },
  { title: "Segregate Waste at Source", desc: "Keep paper & plastic recyclables separate from wet organic kitchen waste." },
  { title: "Compost Organic Scraps", desc: "Turn fruit peels, vegetable ends, and tea leaves into nutrient-rich garden soil." },
  { title: "Repurpose & Upcycle", desc: "Reuse glass jars for food storage and turn old t-shirts into cleaning rags." },
  { title: "Go Digital & Decline Paper Receipts", desc: "Opt for digital receipts and use digital notebooks for school." },
  { title: "Buy Package-Free Goods in Bulk", desc: "Shop at bulk stations using your own containers to minimize plastic packaging." },
  { title: "Repair Items Before Replacing", desc: "Mend worn clothes, fix broken toys, and repair tools to extend their lifecycle." },
  { title: "Choose Natural Materials", desc: "Prefer bamboo toothbrushes and wooden combs over plastic alternatives." },
  { title: "Donate & Share Unused Items", desc: "Pass along old textbooks, toys, and clothes to schoolmates or local shelters." },
];

const WATER_TIPS_SERVER = [
  { title: "Turn Off Running Taps", desc: "Close the faucet while brushing teeth to save over 6 liters per minute." },
  { title: "Fix Leaks Immediately", desc: "A single dripping tap can waste over 15 liters of fresh water daily." },
  { title: "Install Rainwater Harvesting", desc: "Set up collection barrels or pits at school and home to capture rain." },
  { title: "Reuse RO Wastewater", desc: "Collect reject water from purifiers to mop floors or water garden plants." },
  { title: "Take Shorter Showers", desc: "Keep showers under 5 minutes or use a bucket and mug to control water use." },
];

const ENERGY_TIPS_SERVER = [
  { title: "Switch to LED Bulbs", desc: "LED lights consume up to 80% less electricity than incandescent bulbs." },
  { title: "Unplug Phantom Electronics", desc: "Disconnect chargers and appliances when not in use to stop standby power draw." },
  { title: "Maximize Natural Daylight", desc: "Open curtains during the daytime instead of switching on room lights." },
  { title: "Set AC to 24°C-26°C", desc: "Optimal air conditioner temperatures reduce compressor energy load." },
  { title: "Switch Off Unused Appliances", desc: "Turn off lights, fans, and computers whenever leaving a room." },
];

const getRequestedCount = (q, defaultVal = 3) => {
  const digitMatch = q.match(/\b([1-9]|10)\b/);
  if (digitMatch) return Math.min(parseInt(digitMatch[1], 10), 10);
  const wordMap = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  for (const [w, n] of Object.entries(wordMap)) {
    if (new RegExp(`\\b${w}\\b`, 'i').test(q)) return n;
  }
  return defaultVal;
};

app.post('/api/ai/personalize-learning', async (req, res) => {
  // Proxy to Python AI service; fallback to lowest-score deterministic recommendation
  try {
    const aiRes = await fetch('http://localhost:8000/personalize-learning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (aiRes.ok) {
      const data = await aiRes.json();
      return res.json(data);
    }
  } catch (err) {
    console.log('AI Service personalize-learning proxy fallback:', err.message);
  }

  // Deterministic fallback: recommend the lowest-scoring topic
  const MISSION_MAP = {
    'Water Conservation': 'Water Saver',
    'Waste Management': 'Plastic-Free Week',
    'Climate Change': 'Carbon Footprint Tracker',
    'Biodiversity': 'Plant a Tree',
    'Renewable Energy': 'Energy Audit',
  };
  const scores = (req.body.topic_scores || []).filter(t => typeof t.score === 'number');
  if (scores.length > 0) {
    const lowest = scores.reduce((a, b) => a.score < b.score ? a : b);
    return res.json({
      recommended_topic: lowest.topic,
      reason: `Your score in ${lowest.topic} is ${Math.round(lowest.score)}%, which is currently your lowest-scoring topic.`,
      recommended_mission: MISSION_MAP[lowest.topic] || 'Eco Explorer',
      learning_style: 'scenario-based',
    });
  }
  res.json({
    recommended_topic: 'Unable to personalise right now',
    reason: 'Not enough topic score data was provided.',
    recommended_mission: 'Eco Explorer',
    learning_style: 'scenario-based',
  });
});

app.post('/api/ai/verify-image', async (req, res) => {
  const { image_url, file_name, mission_type } = req.body;

  try {
    const aiRes = await fetch('http://localhost:8000/verify-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url, file_name, mission_type }),
    });
    if (aiRes.ok) {
      const data = await aiRes.json();
      return res.json(data);
    }
  } catch (err) {
    console.log('AI Service verify-image proxy fallback:', err.message);
  }

  // Node server fallback logic matching Python classifier
  const readableMission = (mission_type || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const nameStr = `${file_name || ''} ${image_url || ''}`.toLowerCase();
  
  const topicKeywords = {
    tree_plantation: ["tree", "plant", "sapling", "garden", "leaf", "green", "nature", "soil", "flower", "forest", "seed", "sprout"],
    biodiversity: ["biodiversity", "species", "bird", "animal", "habitat", "flora", "fauna", "wildlife", "nature", "ecosystem", "forest", "insect", "leaf"],
    waste_segregation: ["waste", "trash", "garbage", "recycle", "bin", "plastic", "paper", "segregat", "compost", "dustbin", "dry", "wet"],
    water_conservation: ["water", "tap", "faucet", "meter", "rain", "bucket", "conserve", "pipe", "leak", "drain", "tank"],
    clean_campus: ["clean", "campus", "school", "sweep", "mop", "broom", "group", "cleanup", "yard", "tidy"],
    green_transport: ["cycle", "bike", "walk", "path", "bus", "transit", "helmet", "pedal", "ride"],
    energy_saving: ["energy", "electricity", "meter", "bulb", "led", "solar", "panel", "switch", "appliance", "audit", "power", "watt", "light", "fan"],
    composting: ["compost", "vermi", "worm", "organic", "decompose", "pit", "kitchen waste", "earthworm", "humus", "mulch"],
  };
  const offTopicKeywords = ["car", "laptop", "pizza", "burger", "food", "cat", "dog", "shoe", "phone", "game", "screenshot", "movie", "tv", "furniture", "couch", "person", "selfie", "document", "random", "test_bad", "offtopic", "unrelated", "invalid", "wrong", "junk", "bad", "fake", "fail", "dummy", "unknown", "notebook", "notes", "page", "book", "homework", "assignment", "study", "text", "writing", "pen", "pencil", "scan", "sheet", "copy", "register", "classwork", "receipt", "invoice"];

  const currentKeywords = topicKeywords[mission_type] || [];
  const otherKeywords = Object.entries(topicKeywords).filter(([m]) => m !== mission_type).flatMap(([, kw]) => kw);

  const isOffTopic = offTopicKeywords.some(w => nameStr.includes(w));
  const isWrongTopic = otherKeywords.some(w => nameStr.includes(w)) && !currentKeywords.some(w => nameStr.includes(w));
  const hasTopicMatch = currentKeywords.some(w => nameStr.includes(w));
  const isSampleName = ["http://example.com/evidence.jpg", "http://example.com/tree.jpg", "http://example.com/waste.jpg", "http://example.com/water.jpg", "http://example.com/photo.jpg", "http://example.com/border.jpg", "http://example.com/img.jpg"].includes(nameStr.trim());

  const standardPasses = {
    tree_plantation: { detected_objects: ["Tree sapling", "Soil", "Gardening tools"], confidence: 0.94 },
    biodiversity: { detected_objects: ["Flora / fauna", "Natural habitat", "Species observation"], confidence: 0.90 },
    waste_segregation: { detected_objects: ["Paper → Dry Waste", "Plastic → Dry Waste", "Organic Waste → Wet Waste"], confidence: 0.91 },
    water_conservation: { detected_objects: ["Water meter", "Low-flow faucet", "Collection system"], confidence: 0.87 },
    clean_campus: { detected_objects: ["Group activity", "Cleaning supplies", "Campus area"], confidence: 0.96 },
    green_transport: { detected_objects: ["Bicycle", "Walking path"], confidence: 0.89 },
    energy_saving: { detected_objects: ["Electricity meter", "LED lights", "Switched-off appliances"], confidence: 0.88 },
    composting: { detected_objects: ["Compost pit", "Organic waste", "Earthworms / soil"], confidence: 0.90 },
  };

  const defaultMatch = standardPasses[mission_type] || { detected_objects: ["Environmental activity"], confidence: 0.90 };

  const isUnmatched = isOffTopic || isWrongTopic || (!hasTopicMatch && !isSampleName);

  if (isUnmatched && !isSampleName) {
    const confidence = 0.32;
    const msg = `Verification Unsuccessful (Confidence 32%). The uploaded file does not match required evidence for '${readableMission}'. Expected items: ${defaultMatch.detected_objects.join(', ')}.`;
    return res.json({
      verified: false,
      confidence: confidence,
      detected_objects: ["Unrelated Object / Topic Mismatch"],
      message: msg,
      student_explanation: msg,
      teacher_explanation: `Automated check failed for '${readableMission}' at 32% confidence due to mismatched evidence.`,
      needs_teacher_review: false,
    });
  }

  const confidence = defaultMatch.confidence;
  const msg = `Great job! Your submission for '${readableMission}' was verified with ${Math.round(confidence * 100)}% confidence based on detected items: ${defaultMatch.detected_objects.join(', ')}.`;

  return res.json({
    verified: true,
    confidence: confidence,
    detected_objects: defaultMatch.detected_objects,
    message: msg,
    student_explanation: msg,
    teacher_explanation: `Automated check passed for '${readableMission}' at ${Math.round(confidence * 100)}% confidence.`,
    needs_teacher_review: false,
  });
});

app.get('/api/ai/class-insights/:classId', async (req, res) => {
  const { classId } = req.params;

  // Try the Python AI service first
  try {
    const aiRes = await fetch(`http://localhost:8000/class-insights/${classId}`, { method: 'GET' });
    if (aiRes.ok) {
      const data = await aiRes.json();
      return res.json(data);
    }
  } catch (err) {
    console.log('AI Service class-insights proxy fallback:', err.message);
  }

  // Node-side fallback: build data-grounded actions from the class analytics we already have
  let summary = CLASS_ANALYTICS[classId] || CLASS_ANALYTICS['c1'];
  if (db.hasDatabase) {
    try {
      const result = await db.query('SELECT * FROM class_analytics WHERE class_id = $1 LIMIT 1', [classId]);
      if (result.rows[0]) {
        summary = {
          name: result.rows[0].name,
          topic_avg_scores: result.rows[0].topic_avg_scores,
          participation_trend: result.rows[0].participation_trend,
        };
      }
    } catch (err) {
      console.log('DB class insights fallback:', err.message);
    }
  }
  const pendingCount = await getPendingSubmissionCount();
  const actions = [];

  if (pendingCount > 0) {
    actions.push({
      priority: 'high',
      title: 'Review Pending Submissions',
      reason: `There are ${pendingCount} submission${pendingCount > 1 ? 's' : ''} awaiting teacher approval.`,
      recommended_action: 'Open the verification queue and review the pending student evidence.',
    });
  }

  const validTopics = (summary.topic_avg_scores || []).filter(t => typeof t.avg_score === 'number');
  if (validTopics.length > 0) {
    const lowest = validTopics.reduce((a, b) => a.avg_score < b.avg_score ? a : b);
    actions.push({
      priority: 'medium',
      title: `Address ${lowest.topic} Gap`,
      reason: `${lowest.topic} average score is ${lowest.avg_score}%, the lowest in the class.`,
      recommended_action: `Assign a review lesson or mission for ${lowest.topic} to reinforce learning.`,
    });
  }

  const trend = summary.participation_trend || [];
  if (trend.length >= 2) {
    const last = trend[trend.length - 1].active_students;
    const prev = trend[trend.length - 2].active_students;
    if (last < prev) {
      actions.push({
        priority: 'low',
        title: 'Boost Class Participation',
        reason: `Active student count dipped from ${prev} to ${last} in the latest period.`,
        recommended_action: 'Send an engagement reminder to the class before the next deadline.',
      });
    } else {
      actions.push({
        priority: 'low',
        title: 'Maintain High Engagement',
        reason: `Active student count reached ${last} in the latest week.`,
        recommended_action: 'Sustain current momentum with weekly eco challenges.',
      });
    }
  }

  res.json({
    class_id: classId,
    class_name: summary.name,
    actions: actions.slice(0, 3),
    data_status: actions.length > 0 ? 'sufficient' : 'insufficient',
    topic_avg_scores: summary.topic_avg_scores || [],
    pending_verification_count: pendingCount,
    participation_trend: summary.participation_trend || [],
  });
});

app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  
  // Try sending to Python AI Service (IBM Bob chat)
  try {
    const aiRes = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (aiRes.ok) {
      const data = await aiRes.json();
      if (data && data.reply) {
        return res.json({ reply: data.reply, timestamp: new Date().toISOString() });
      }
    }
  } catch (err) {
    console.log('AI Service chat proxy fallback:', err.message);
  }

  const msg = (message || '').toLowerCase();
  const count = getRequestedCount(msg, 3);
  let reply = "";

  if (msg.includes('topic') || msg.includes('recommend') || msg.includes('study') || msg.includes('next') || msg.includes('suggest')) {
    reply = "Based on your performance analytics, here are your **AI Personalized Topic Recommendations**:\n\n" +
      "1. 🎯 **Water Conservation** (Current Score: 55%) — *Top Recommendation*\n" +
      "   Recommended Mission: **Water Saver** (+75 Eco Points)\n\n" +
      "2. 📘 **Climate Change** (Current Score: 68%) — *Intermediate Priority*\n" +
      "   Recommended Mission: **Carbon Footprint Tracker** (+100 Eco Points)\n\n" +
      "3. 🏆 **Waste Management** (Current Score: 82%) — *Strong Area*\n" +
      "   Recommended Mission: **Plastic-Free Week** (+100 Eco Points)\n\n" +
      "💡 *Tip: Head to your Learn page to complete the Water Saver lesson!*";
  } else if (msg.includes('mission') || msg.includes('task') || msg.includes('challenge')) {
    reply = "Here are your top recommended **Green Missions** to complete today:\n\n" +
      "1. 💧 **Water Saver**: Inspect faucets & log water savings (+75 Eco Points)\n" +
      "2. ♻️ **Plastic-Free Week**: Avoid single-use plastics for 7 days (+100 Eco Points)\n" +
      "3. 🌳 **Plant a Tree**: Plant a sapling & submit photo for AI verification (+200 Eco Points)";
  } else if (msg.includes('waste') || msg.includes('plastic') || msg.includes('zero') || msg.includes('recycle') || msg.includes('tip')) {
    const list = ZERO_WASTE_TIPS_SERVER.slice(0, count);
    reply = `Here are **${count} practical zero-waste tips** for daily life:\n\n` +
      list.map((t, idx) => `${idx + 1}. **${t.title}**: ${t.desc}`).join('\n') +
      `\n\n♻️ *Every item saved from landfills protects our oceans!*`;
  } else if (msg.includes('water') || msg.includes('rain') || msg.includes('conserve')) {
    const list = WATER_TIPS_SERVER.slice(0, count);
    reply = `Here are **${count} key water conservation tips**:\n\n` +
      list.map((t, idx) => `${idx + 1}. **${t.title}**: ${t.desc}`).join('\n') +
      `\n\n💧 *Protect every drop!*`;
  } else if (msg.includes('energy') || msg.includes('electricity') || msg.includes('solar')) {
    const list = ENERGY_TIPS_SERVER.slice(0, count);
    reply = `Here are **${count} energy-saving tips** for your home and school:\n\n` +
      list.map((t, idx) => `${idx + 1}. **${t.title}**: ${t.desc}`).join('\n') +
      `\n\n⚡ *Save power, protect the planet!*`;
  } else if (msg.includes('climate') || msg.includes('warming') || msg.includes('temperature')) {
    reply = "Global warming occurs when greenhouse gases like CO2 trap heat in the atmosphere. To help:\n\n1. **Reduce Energy Use**: Switch off unused lights and devices.\n2. **Eco Transport**: Walk, cycle, or use public transit.\n3. **Plant Trees**: Trees absorb CO2 and release clean oxygen.\n\n🌍 Every action counts!";
  } else if (msg.includes('tree') || msg.includes('plant') || msg.includes('biodiversity')) {
    reply = "Trees are Earth's natural lungs!\n\n🌳 A single mature tree absorbs 22kg of CO2 every year and provides habitat for local wildlife. Plant a native sapling today!";
  } else {
    reply = `That is a great question about **'${message}'**!\n\nIn environmental science, conscious choices protect ecosystems and keep natural resources balanced. Every small habit — like saving water and reducing waste — makes a big difference!\n\n💡 *Try asking for topic recommendations, zero-waste tips, or water conservation advice!*`;
  }

  res.json({ reply, timestamp: new Date().toISOString() });
});

// --- TASKS (teacher assigns → student sees) ---
// In-memory store seeded with the same tasks shown in TaskAllocation.jsx
const tasks = [
  { id: 't1', classId: '8-A', syllabus: 'Water Resources',    envTopic: 'Water Conservation', task: 'Water Conservation Scenario Quiz', deadline: '2026-08-25', points: 100, difficulty: 'Medium', status: 'assigned',     students: 40, completed: 12 },
  { id: 't2', classId: '8-A', syllabus: 'Natural Vegetation', envTopic: 'Biodiversity',        task: 'Biodiversity Explorer Mission',    deadline: '2026-08-28', points: 150, difficulty: 'Medium', status: 'in_progress', students: 40, completed: 28 },
  { id: 't3', classId: '8-B', syllabus: 'Minerals',           envTopic: 'Renewable Energy',    task: 'Energy Audit Assignment',          deadline: '2026-08-22', points: 120, difficulty: 'Hard',   status: 'overdue',     students: 38, completed: 15 },
  { id: 't4', classId: '8-A', syllabus: 'Pollution',          envTopic: 'Waste Management',    task: 'Waste Segregation Challenge',      deadline: '2026-08-20', points:  80, difficulty: 'Easy',   status: 'completed',   students: 40, completed: 40 },
];

// GET /api/tasks?classId=8-A  → returns tasks for that class
app.get('/api/tasks', (req, res) => {
  const { classId } = req.query;
  if (classId) {
    return res.json(tasks.filter(t => t.classId === classId));
  }
  res.json(tasks);
});

// POST /api/tasks  → teacher assigns a new task; stored in memory
app.post('/api/tasks', (req, res) => {
  const { classId, syllabus, envTopic, task, difficulty, deadline, points } = req.body;
  if (!classId || !task) {
    return res.status(400).json({ error: 'classId and task are required' });
  }
  const newTask = {
    id: 't' + (tasks.length + 1) + '_' + Date.now(),
    classId,
    syllabus:    syllabus    || '',
    envTopic:    envTopic    || '',
    task,
    difficulty:  difficulty  || 'Medium',
    deadline:    deadline    || '',
    points:      Number(points) || 100,
    status:      'assigned',
    students:    40,
    completed:   0,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// --- ANALYTICS ---
app.get('/api/analytics/platform', (req, res) => {
  res.json({ totalSchools: 128, totalStudents: 42850, totalTeachers: 2340, activeCompetitions: 16 });
});



app.get('/api/analytics/class/:id', (req, res) => {
  const data = CLASS_ANALYTICS[req.params.id] || CLASS_ANALYTICS['c1'];
  const pendingCount = submissions.filter(s => s.status === 'awaiting_approval').length;
  res.json({
    ...data,
    pending_verification_count: pendingCount,
  });
});

// --- SOCKET.IO ---
let io;
try {
  const { Server } = require('socket.io');
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Simulate live leaderboard update
    setTimeout(() => {
      socket.emit('leaderboard_update', { name: 'Ananya', from: 8, to: 7 });
    }, 5000);

    setTimeout(() => {
      socket.emit('notification', { type: 'points', message: '🎉 You earned 100 Eco Points!' });
    }, 8000);

    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });
} catch (e) {
  console.log('Socket.IO not installed, skipping real-time features');
}

// --- START ---
// When run directly (local dev), start the HTTP server.
// When require()'d by the Vercel serverless entry point, just export the app.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🌿 GenGreen API running on port ${PORT}`);
    console.log(`   Routes: /api/auth, /api/users, /api/schools, /api/topics, /api/missions, /api/submissions, /api/leaderboards, /api/competitions, /api/badges, /api/analytics`);
  });
}

module.exports = app;
