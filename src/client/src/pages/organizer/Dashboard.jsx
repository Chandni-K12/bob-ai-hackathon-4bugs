import { motion } from 'framer-motion';
import { mockOrganizerMetrics, mockSchoolLeaderboard, mockCompetitions, mockMonthlyProgress } from '../../data/mockData';
import { formatNumber } from '../../lib/utils';
import { Building, Users, GraduationCap, Trophy, Target, Zap, Shield, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function MetricCard({ icon: Icon, label, value, gradient }) {
  return (
    <motion.div variants={item} className="glass rounded-xl p-4 relative overflow-hidden">
      <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

export default function OrganizerDashboard() {
  const m = mockOrganizerMetrics;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all schools, competitions, and environmental activities</p>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard icon={Building} label="Total Schools" value={m.totalSchools} gradient="bg-gradient-to-br from-purple-500 to-pink-600" />
        <MetricCard icon={Users} label="Total Students" value={m.totalStudents} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <MetricCard icon={GraduationCap} label="Total Teachers" value={m.totalTeachers} gradient="bg-gradient-to-br from-teal-500 to-cyan-600" />
        <MetricCard icon={Trophy} label="Active Competitions" value={m.activeCompetitions} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        <MetricCard icon={Target} label="Missions Completed" value={m.missionsCompleted} gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
        <MetricCard icon={Zap} label="Eco Points Generated" value={m.ecoPointsGenerated} gradient="bg-gradient-to-br from-yellow-500 to-amber-600" />
        <MetricCard icon={Shield} label="Verified Actions" value={m.verifiedActions} gradient="bg-gradient-to-br from-indigo-500 to-violet-600" />
        <MetricCard icon={TrendingUp} label="Growth This Month" value="+18%" gradient="bg-gradient-to-br from-rose-500 to-red-600" />
      </motion.div>

      {/* Platform Activity Chart */}
      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-eco-green" /> Platform Activity Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mockMonthlyProgress}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="points" name="Eco Points (×1)" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
            <Area type="monotone" dataKey="missions" name="Missions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            <Area type="monotone" dataKey="students" name="Active Students" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Schools */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-eco-purple" /> Top Schools</h3>
          <div className="space-y-3">
            {mockSchoolLeaderboard.map((school, i) => (
              <div key={school.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i === 0 ? 'bg-yellow-400/20 text-yellow-400' : i === 1 ? 'bg-gray-300/20 text-gray-300' : i === 2 ? 'bg-amber-600/20 text-amber-600' : 'bg-secondary text-muted-foreground'
                }`}>#{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{school.name}</p>
                  <p className="text-xs text-muted-foreground">{school.city} • {school.students} students</p>
                </div>
                <p className="text-sm font-bold text-eco-green">{formatNumber(school.points)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Competitions */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-eco-gold" /> Active Competitions</h3>
          <div className="space-y-3">
            {mockCompetitions.filter(c => c.status !== 'completed').slice(0, 4).map(comp => (
              <div key={comp.id} className="p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{comp.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    comp.status === 'active' ? 'bg-eco-green/10 text-eco-green' : 'bg-eco-amber/10 text-eco-amber'
                  }`}>{comp.status}</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{comp.schools} schools</span>
                  <span>{formatNumber(comp.students)} students</span>
                  <span>{comp.missions} missions</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
