const express = require('express');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- MOCK DATA ---
const users = [
  { id: 'u1', name: 'Ananya Sharma', email: 'ananya@student.eco', password: '$2b$10$mockhashedpassword', role: 'student', schoolId: 's1', classId: 'c1', points: 2450, streak: 5, level: 12, badges: 12 },
  { id: 't1', name: 'Dr. Meera Reddy', email: 'meera@teacher.eco', password: '$2b$10$mockhashedpassword', role: 'teacher', schoolId: 's1', classId: 'c1' },
  { id: 'o1', name: 'Mrs. Lakshmi Menon', email: 'lakshmi@organizer.eco', password: '$2b$10$mockhashedpassword', role: 'organizer' },
];

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
app.get('/api/submissions', (req, res) => {
  res.json([
    { id: 'sub1', studentName: 'Ananya Sharma', missionTitle: 'Plant a Tree', aiConfidence: 94, status: 'awaiting_approval' },
  ]);
});

app.put('/api/submissions/:id/approve', (req, res) => {
  res.json({ success: true, message: 'Submission approved', pointsAwarded: 100 });
});

app.put('/api/submissions/:id/reject', (req, res) => {
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

app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  const msg = (message || '').toLowerCase();
  const count = getRequestedCount(msg, 3);
  let reply = "";

  if (msg.includes('waste') || msg.includes('plastic') || msg.includes('zero') || msg.includes('recycle') || msg.includes('tip')) {
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
    reply = "Every small eco-friendly habit counts! Practice the 3 R's (Reduce, Reuse, Recycle), save energy, and inspire your classmates on GenGreen!";
  }

  res.json({ reply, timestamp: new Date().toISOString() });
});

// --- ANALYTICS ---
app.get('/api/analytics/platform', (req, res) => {
  res.json({ totalSchools: 128, totalStudents: 42850, totalTeachers: 2340, activeCompetitions: 16 });
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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🌿 GenGreen API running on port ${PORT}`);
  console.log(`   Routes: /api/auth, /api/users, /api/schools, /api/topics, /api/missions, /api/submissions, /api/leaderboards, /api/competitions, /api/badges, /api/analytics`);
});
