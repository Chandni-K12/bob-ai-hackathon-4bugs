import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockStudentPerformance, mockTopicPerformance, mockWeeklyActivity } from '../../data/mockData';
import { formatNumber, getPerformanceColor, getPerformanceLabel } from '../../lib/utils';
import { BarChart3, Search, Filter, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
const perfDistribution = [
  { name: 'Excellent', value: 3 },
  { name: 'Good', value: 3 },
  { name: 'Needs Improvement', value: 2 },
];

export default function PerformancePage() {
  const [search, setSearch] = useState('');
  const [filterPerf, setFilterPerf] = useState('all');

  const filtered = mockStudentPerformance.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterPerf === 'all' || s.performance === filterPerf;
    return matchSearch && matchFilter;
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-eco-blue" /> Student Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor and grade student environmental performance</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quiz Accuracy Trend */}
        <motion.div variants={item} className="lg:col-span-2 glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Topic-wise Quiz Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockTopicPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="students" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Performance Distribution */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4">Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={perfDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {perfDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none text-sm"
            placeholder="Search students..." />
        </div>
        <div className="flex gap-2">
          {['all', 'Excellent', 'Good', 'Needs Improvement'].map(f => (
            <button key={f} onClick={() => setFilterPerf(f)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${filterPerf === f ? 'bg-eco-blue text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Student Table */}
      <motion.div variants={item} className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Quiz Score</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Missions</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Streak</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Eco Points</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition">
                  <td className="py-3 px-4 font-medium">{s.name}</td>
                  <td className={`py-3 px-4 text-right font-medium ${getPerformanceColor(s.quizScore)}`}>{s.quizScore}%</td>
                  <td className="py-3 px-4 text-right">{s.missions}</td>
                  <td className="py-3 px-4 text-right">{s.streak} weeks</td>
                  <td className="py-3 px-4 text-right font-medium">{formatNumber(s.ecoPoints)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      s.performance === 'Excellent' ? 'bg-eco-green/10 text-eco-green' :
                      s.performance === 'Good' ? 'bg-eco-amber/10 text-eco-amber' : 'bg-destructive/10 text-destructive'
                    }`}>{s.performance}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
