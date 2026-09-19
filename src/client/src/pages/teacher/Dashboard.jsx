import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsAPI, submissionsAPI, tasksAPI, usersAPI } from '../../services/api';
import { formatNumber } from '../../lib/utils';
import { Users, UserCheck, TrendingUp, ClipboardCheck, ClipboardList, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const getPerformanceLabel = (points) => {
  const value = Number(points ?? 0);
  if (value >= 500) return 'Excellent';
  if (value >= 200) return 'Good';
  return 'Needs Improvement';
};

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
  const [summary, setSummary] = useState({ totalStudents: 0, activeStudents: 0, averagePerformance: 0, pendingReviews: 0, tasksAssigned: 0 });
  const [topicPerformance, setTopicPerformance] = useState([]);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user?.classId) return;

    let active = true;

    Promise.all([
      usersAPI.getAll(),
      tasksAPI.getByClass(user.classId),
      submissionsAPI.getAll(),
      analyticsAPI.getClass(user.classId),
    ])
      .then(([usersRes, tasksRes, submissionsRes, analyticsRes]) => {
        if (!active) return;

        const classStudents = (usersRes.data || []).filter(
          (entry) => entry.role === 'student' && String(entry.classId ?? entry.class_id) === String(user.classId)
        );

        const activeStudents = classStudents.filter((student) => Number(student.points ?? 0) > 0 || Number(student.streak ?? 0) > 0).length;
        const averagePerformance = classStudents.length
          ? Math.round(
              classStudents.reduce((sum, student) => sum + Math.min(100, Math.round((Number(student.points ?? 0) / 10))), 0) / classStudents.length
            )
          : 0;

        const pendingReviews = (submissionsRes.data || []).filter((submission) => submission.status === 'awaiting_approval').length;
        const topicData = Array.isArray(analyticsRes.data?.topic_avg_scores) ? analyticsRes.data.topic_avg_scores : [];
        const participationTrend = Array.isArray(analyticsRes.data?.participation_trend) ? analyticsRes.data.participation_trend : [];

        setStudents(classStudents);
        setSummary({
          totalStudents: classStudents.length,
          activeStudents,
          averagePerformance,
          pendingReviews,
          tasksAssigned: tasksRes.data?.length || 0,
        });
        setTopicPerformance(topicData);
        setWeeklyActivity(
          participationTrend.map((item) => ({
            day: item.week || item.label || 'Week',
            lessons: Number(item.active_students ?? 0),
            quizzes: Number(item.active_students ?? 0),
            missions: Number(item.active_students ?? 0),
          }))
        );
      })
      .catch((error) => {
        console.error('Failed to load teacher dashboard data:', error);
      });

    return () => {
      active = false;
    };
  }, [user?.classId]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Teacher'}</h1>
        <p className="text-sm text-muted-foreground">{user?.className || user?.classId} • {user?.schoolName || user?.schoolId}</p>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Total Students" value={summary.totalStudents} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <StatCard icon={UserCheck} label="Active Students" value={summary.activeStudents} color="bg-gradient-to-br from-green-500 to-emerald-600" />
        <StatCard icon={TrendingUp} label="Avg Performance" value={`${summary.averagePerformance}%`} color="bg-gradient-to-br from-amber-500 to-orange-600" />
        <StatCard icon={ClipboardCheck} label="Pending Reviews" value={summary.pendingReviews} color="bg-gradient-to-br from-rose-500 to-pink-600" />
        <StatCard icon={ClipboardList} label="Tasks Assigned" value={summary.tasksAssigned} color="bg-gradient-to-br from-purple-500 to-violet-600" />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-eco-blue" /> Topic-wise Performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topicPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-eco-green" /> Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyActivity}>
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

      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-eco-purple" /> Student Performance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Student</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Level</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Streak</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Eco Pts</th>
                <th className="text-right py-2 px-3 text-muted-foreground font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 5).map((student) => (
                <tr key={student.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="py-2.5 px-3 font-medium">{student.name}</td>
                  <td className="py-2.5 px-3 text-right">{student.level ?? 1}</td>
                  <td className="py-2.5 px-3 text-right">{student.streak ?? 0} days</td>
                  <td className="py-2.5 px-3 text-right font-medium">{formatNumber(Number(student.points ?? 0))}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      getPerformanceLabel(student.points) === 'Excellent' ? 'bg-eco-green/10 text-eco-green' :
                      getPerformanceLabel(student.points) === 'Good' ? 'bg-eco-amber/10 text-eco-amber' : 'bg-destructive/10 text-destructive'
                    }`}>{getPerformanceLabel(student.points)}</span>
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
