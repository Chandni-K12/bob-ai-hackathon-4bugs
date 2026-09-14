import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { mockTeacherMetrics, mockStudentPerformance, mockTopicPerformance, mockWeeklyActivity } from '../../data/mockData';
import { formatNumber } from '../../lib/utils';
import { Users, UserCheck, TrendingUp, ClipboardCheck, ClipboardList, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div variants={item} className="glass rounded-xl p-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const m = mockTeacherMetrics;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Teacher'}</h1>
        <p className="text-sm text-muted-foreground">{user?.className} • {user?.schoolName}</p>
      </motion.div>

      {/* Metric Cards */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Total Students" value={m.totalStudents} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <StatCard icon={UserCheck} label="Active Students" value={m.activeStudents} color="bg-gradient-to-br from-green-500 to-emerald-600" />
        <StatCard icon={TrendingUp} label="Avg Performance" value={`${m.averagePerformance}%`} color="bg-gradient-to-br from-amber-500 to-orange-600" />
        <StatCard icon={ClipboardCheck} label="Pending Reviews" value={m.pendingReviews} color="bg-gradient-to-br from-rose-500 to-pink-600" />
        <StatCard icon={ClipboardList} label="Tasks Assigned" value={m.tasksAssigned} color="bg-gradient-to-br from-purple-500 to-violet-600" />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Topic Performance */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-eco-blue" /> Topic-wise Performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mockTopicPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-eco-green" /> Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mockWeeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Legend />
              <Area type="monotone" dataKey="lessons" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
              <Area type="monotone" dataKey="quizzes" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
              <Area type="monotone" dataKey="missions" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Students */}
      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-eco-purple" /> Student Performance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Student</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Quiz</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Missions</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Streak</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Eco Pts</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockStudentPerformance.slice(0, 5).map((s, i) => (
                <tr key={s.name} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-2.5 px-3 font-medium">{s.name}</td>
                  <td className="py-2.5 px-3 text-right">{s.quizScore}%</td>
                  <td className="py-2.5 px-3 text-right">{s.missions}</td>
                  <td className="py-2.5 px-3 text-right">{s.streak} weeks</td>
                  <td className="py-2.5 px-3 text-right font-medium">{formatNumber(s.ecoPoints)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.performance === 'Excellent' ? 'bg-eco-green/10 text-eco-green' :
                      s.performance === 'Good' ? 'bg-eco-amber/10 text-eco-amber' : 'bg-destructive/10 text-destructive'
                    }`}>{s.performance}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
