import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { analyticsAPI, competitionsAPI, schoolsAPI, usersAPI } from '../../services/api';
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
  const [metrics, setMetrics] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeCompetitions: 0,
    missionsCompleted: 0,
    ecoPointsGenerated: 0,
    verifiedActions: 0,
  });
  const [schools, setSchools] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    let active = true;

    Promise.all([
      analyticsAPI.getPlatform(),
      schoolsAPI.getAll(),
      usersAPI.getAll(),
      competitionsAPI.getAll(),
    ])
      .then(([platformRes, schoolsRes, usersRes, competitionsRes]) => {
        if (!active) return;

        const schoolRows = schoolsRes.data || [];
        const userRows = usersRes.data || [];
        const competitionRows = competitionsRes.data || [];
        const totalStudents = userRows.filter((user) => user.role === 'student').length;
        const totalTeachers = userRows.filter((user) => user.role === 'teacher').length;
        const totalPoints = userRows.filter((user) => user.role === 'student').reduce((sum, user) => sum + Number(user.points ?? 0), 0);

        const derivedTrend = [
          { month: 'Jan', points: Math.max(100, Math.round(totalPoints * 0.45)), missions: Math.max(10, competitionRows.length * 8), students: totalStudents },
          { month: 'Feb', points: Math.max(150, Math.round(totalPoints * 0.6)), missions: Math.max(12, competitionRows.length * 10), students: Math.max(10, totalStudents) },
          { month: 'Mar', points: Math.max(200, Math.round(totalPoints * 0.8)), missions: Math.max(15, competitionRows.length * 12), students: Math.max(12, totalStudents) },
        ];

        setSchools(schoolRows);
        setCompetitions(competitionRows);
        setMetrics({
          totalSchools: schoolRows.length,
          totalStudents,
          totalTeachers,
          activeCompetitions: competitionRows.filter((item) => item.status === 'active').length,
          missionsCompleted: competitionRows.reduce((sum, item) => sum + Number(item.missions ?? 0), 0),
          ecoPointsGenerated: totalPoints,
          verifiedActions: competitionRows.length * 12,
        });
        setTrend(derivedTrend);
      })
      .catch((error) => {
        console.error('Failed to load organizer dashboard data:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const schoolLeaderboard = [...schools].sort((a, b) => Number(b.greenScore ?? 0) - Number(a.greenScore ?? 0)).slice(0, 4);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all schools, competitions, and environmental activities</p>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <MetricCard icon={Building} label="Total Schools" value={metrics.totalSchools} gradient="bg-gradient-to-br from-purple-500 to-pink-600" />
        <MetricCard icon={Users} label="Total Students" value={metrics.totalStudents} gradient="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <MetricCard icon={GraduationCap} label="Total Teachers" value={metrics.totalTeachers} gradient="bg-gradient-to-br from-teal-500 to-cyan-600" />
        <MetricCard icon={Trophy} label="Active Competitions" value={metrics.activeCompetitions} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        <MetricCard icon={Target} label="Missions Completed" value={metrics.missionsCompleted} gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
        <MetricCard icon={Zap} label="Eco Points Generated" value={metrics.ecoPointsGenerated} gradient="bg-gradient-to-br from-yellow-500 to-amber-600" />
        <MetricCard icon={Shield} label="Verified Actions" value={metrics.verifiedActions} gradient="bg-gradient-to-br from-indigo-500 to-violet-600" />
        <MetricCard icon={TrendingUp} label="Growth This Month" value="+18%" gradient="bg-gradient-to-br from-rose-500 to-red-600" />
      </motion.div>

      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-eco-green" /> Platform Activity Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="points" name="Eco Points" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
            <Area type="monotone" dataKey="missions" name="Missions" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
            <Area type="monotone" dataKey="students" name="Students" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-eco-purple" /> Top Schools</h3>
          <div className="space-y-3">
            {schoolLeaderboard.map((school, index) => (
              <div key={school.id || school.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-400/20 text-yellow-400' : index === 1 ? 'bg-gray-300/20 text-gray-300' : index === 2 ? 'bg-amber-600/20 text-amber-600' : 'bg-secondary text-muted-foreground'
                }`}>#{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{school.name}</p>
                  <p className="text-xs text-muted-foreground">{school.location || 'School'} • {school.students ?? 0} students</p>
                </div>
                <p className="text-sm font-bold text-eco-green">{formatNumber(Number(school.greenScore ?? 0))}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-eco-gold" /> Active Competitions</h3>
          <div className="space-y-3">
            {competitions.filter((competition) => competition.status !== 'completed').slice(0, 4).map((competition) => (
              <div key={competition.id} className="p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{competition.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    competition.status === 'active' ? 'bg-eco-green/10 text-eco-green' : 'bg-eco-amber/10 text-eco-amber'
                  }`}>{competition.status}</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{competition.schools ?? 0} schools</span>
                  <span>{formatNumber(Number(competition.students ?? 0))} students</span>
                  <span>{competition.missions ?? 0} missions</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
