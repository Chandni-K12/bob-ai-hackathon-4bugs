import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockTopicPerformance, mockWeeklyActivity, mockMonthlyProgress, mockSchoolLeaderboard } from '../../data/mockData';
import { formatNumber } from '../../lib/utils';
import { BarChart3, Filter } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar,
} from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#f43f5e'];

const schoolParticipation = [
  { name: 'Green Valley', students: 480, active: 420, missions: 2400 },
  { name: 'Sunrise', students: 620, active: 510, missions: 3100 },
  { name: 'ABC Public', students: 390, active: 300, missions: 1800 },
  { name: 'Delhi Modern', students: 510, active: 440, missions: 2700 },
  { name: 'Pune Green', students: 350, active: 290, missions: 1600 },
];

const envActivities = [
  { name: 'Tree Plantation', value: 3400 },
  { name: 'Waste Segregation', value: 5200 },
  { name: 'Water Conservation', value: 2800 },
  { name: 'Clean-up Drives', value: 1900 },
  { name: 'Energy Audits', value: 1200 },
];

export default function AnalyticsPage() {
  const [stateFilter, setStateFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('month');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-eco-purple" /> Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive analytics across all schools and competitions</p>
        </div>
        <div className="flex gap-2">
          <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-secondary border border-border text-xs outline-none">
            <option value="all">All States</option><option>Telangana</option><option>Karnataka</option><option>Tamil Nadu</option><option>Delhi</option><option>Maharashtra</option>
          </select>
          <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
            {['week', 'month', 'year'].map(t => (
              <button key={t} onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${timeFilter === t ? 'bg-card text-foreground' : 'text-muted-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* School-wise Participation */}
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

        {/* Environmental Activities */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Verified Environmental Activities</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={envActivities} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {envActivities.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Topic-wise Learning */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Topic-wise Learning Progress</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mockTopicPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis dataKey="topic" type="category" width={70} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Active Users */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Weekly Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={mockWeeklyActivity}>
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

      {/* Mission Completion Trend */}
      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4">Monthly Mission Completion Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={mockMonthlyProgress}>
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
