import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI, usersAPI } from '../../services/api';
import { formatNumber } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
const getPerformanceLabel = (points) => {
  const value = Number(points ?? 0);
  if (value >= 500) return 'Excellent';
  if (value >= 200) return 'Good';
  return 'Needs Improvement';
};

export default function PerformancePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterPerf, setFilterPerf] = useState('all');
  const [students, setStudents] = useState([]);
  const [topicPerformance, setTopicPerformance] = useState([]);

  useEffect(() => {
    if (!user?.classId) return;

    let active = true;
    Promise.all([
      usersAPI.getAll(),
      analyticsAPI.getClass(user.classId),
    ])
      .then(([usersRes, analyticsRes]) => {
        if (!active) return;
        const classStudents = (usersRes.data || []).filter(
          (entry) => entry.role === 'student' && String(entry.classId ?? entry.class_id) === String(user.classId)
        );
        setStudents(classStudents);
        setTopicPerformance(Array.isArray(analyticsRes.data?.topic_avg_scores) ? analyticsRes.data.topic_avg_scores : []);
      })
      .catch((error) => {
        console.error('Failed to load class performance data:', error);
      });

    return () => {
      active = false;
    };
  }, [user?.classId]);

  const perfDistribution = [
    { name: 'Excellent', value: students.filter((student) => getPerformanceLabel(student.points) === 'Excellent').length },
    { name: 'Good', value: students.filter((student) => getPerformanceLabel(student.points) === 'Good').length },
    { name: 'Needs Improvement', value: students.filter((student) => getPerformanceLabel(student.points) === 'Needs Improvement').length },
  ];

  const filtered = students.filter((student) => {
    const matchSearch = student.name.toLowerCase().includes(search.toLowerCase());
    const performance = getPerformanceLabel(student.points);
    const matchFilter = filterPerf === 'all' || performance === filterPerf;
    return matchSearch && matchFilter;
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-eco-blue" /> Student Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and grade student environmental performance</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Topic-wise Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
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
          <h3 className="font-semibold mb-4">Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={perfDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {perfDistribution.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none text-sm"
            placeholder="Search students..." />
        </div>
        <div className="flex gap-2">
          {['all', 'Excellent', 'Good', 'Needs Improvement'].map((filter) => (
            <button key={filter} onClick={() => setFilterPerf(filter)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${filterPerf === filter ? 'bg-eco-blue text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {filter === 'all' ? 'All' : filter}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Level</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Streak</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Eco Points</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => {
                const performance = getPerformanceLabel(student.points);
                return (
                  <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 hover:bg-secondary/30 transition">
                    <td className="py-3 px-4 font-medium">{student.name}</td>
                    <td className="py-3 px-4 text-right">{student.level ?? 1}</td>
                    <td className="py-3 px-4 text-right">{student.streak ?? 0} days</td>
                    <td className="py-3 px-4 text-right font-medium">{formatNumber(Number(student.points ?? 0))}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        performance === 'Excellent' ? 'bg-eco-green/10 text-eco-green' :
                        performance === 'Good' ? 'bg-eco-amber/10 text-eco-amber' : 'bg-destructive/10 text-destructive'
                      }`}>{performance}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
