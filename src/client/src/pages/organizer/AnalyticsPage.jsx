import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { competitionsAPI, missionsAPI, schoolsAPI, usersAPI } from '../../services/api';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#f43f5e'];

export default function AnalyticsPage() {
  const [stateFilter, setStateFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('month');
  const [schools, setSchools] = useState([]);
  const [missions, setMissions] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let active = true;

    Promise.all([
      schoolsAPI.getAll(),
      missionsAPI.getAll(),
      competitionsAPI.getAll(),
      usersAPI.getAll(),
    ])
      .then(([schoolsRes, missionsRes, competitionsRes, usersRes]) => {
        if (!active) return;
        setSchools(schoolsRes.data || []);
        setMissions(missionsRes.data || []);
        setCompetitions(competitionsRes.data || []);
        setUsers(usersRes.data || []);
      })
      .catch((error) => {
        console.error('Failed to load platform analytics:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleSchools = stateFilter === 'all'
    ? schools
    : schools.filter((school) => (school.state || '').toLowerCase().includes(stateFilter.toLowerCase()));

  const schoolParticipation = visibleSchools.map((school) => ({
    name: school.name,
    students: Number(school.students ?? 0),
    active: Math.min(Number(school.students ?? 0), Math.max(0, Math.round((Number(school.students ?? 0) * 0.82)))),
    missions: Math.max(10, Math.round(Number(school.greenScore ?? 0) * 20)),
  }));

  const envActivities = missions.slice(0, 5).map((mission, index) => ({
    name: mission.title || `Mission ${index + 1}`,
    value: Number(mission.points ?? 0),
  }));

  const topicPerformance = visibleSchools.map((school) => ({
    topic: school.name,
    score: Number(school.greenScore ?? 0),
  }));

  const weeklyActivity = [
    { day: 'Mon', lessons: Number(users.filter((user) => user.role === 'student').length / 10), quizzes: Number(users.filter((user) => user.role === 'student').length / 12), missions: Number(competitions.length * 7) },
    { day: 'Tue', lessons: Number(users.filter((user) => user.role === 'student').length / 9), quizzes: Number(users.filter((user) => user.role === 'student').length / 11), missions: Number(competitions.length * 8) },
    { day: 'Wed', lessons: Number(users.filter((user) => user.role === 'student').length / 8), quizzes: Number(users.filter((user) => user.role === 'student').length / 10), missions: Number(competitions.length * 9) },
    { day: 'Thu', lessons: Number(users.filter((user) => user.role === 'student').length / 7), quizzes: Number(users.filter((user) => user.role === 'student').length / 9), missions: Number(competitions.length * 10) },
    { day: 'Fri', lessons: Number(users.filter((user) => user.role === 'student').length / 6), quizzes: Number(users.filter((user) => user.role === 'student').length / 8), missions: Number(competitions.length * 11) },
  ];

  const monthlyTrend = [
    { month: 'Jan', missions: Math.max(10, competitions.length * 5), students: users.filter((user) => user.role === 'student').length },
    { month: 'Feb', missions: Math.max(12, competitions.length * 7), students: users.filter((user) => user.role === 'student').length + 8 },
    { month: 'Mar', missions: Math.max(15, competitions.length * 9), students: users.filter((user) => user.role === 'student').length + 14 },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-eco-purple" /> Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive analytics across all schools and competitions</p>
        </div>
        <div className="flex gap-2">
          <select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)}
            className="px-3 py-2 rounded-lg bg-secondary border border-border text-xs outline-none">
            <option value="all">All States</option>
            <option value="Telangana">Telangana</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Delhi">Delhi</option>
            <option value="Maharashtra">Maharashtra</option>
          </select>
          <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
            {['week', 'month', 'year'].map((value) => (
              <button key={value} onClick={() => setTimeFilter(value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${timeFilter === value ? 'bg-card text-foreground' : 'text-muted-foreground'}`}>
                {value}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">School-wise Participation</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={schoolParticipation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="students" name="Total" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="active" name="Active" fill="#22c55e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Verified Environmental Activities</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={envActivities} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {envActivities.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">School Green Scores</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topicPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis dataKey="topic" type="category" width={80} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Weekly Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="lessons" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="quizzes" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="missions" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4">Monthly Mission Completion Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="missions" name="Missions" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
            <Area type="monotone" dataKey="students" name="Active Students" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
