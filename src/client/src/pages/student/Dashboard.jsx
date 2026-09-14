import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { mockMissions, mockTopics, mockGreenScore, mockNotifications } from '../../data/mockData';
import { formatNumber } from '../../lib/utils';
import { Link } from 'react-router-dom';
import {
  Zap, Flame, Trophy, School, Target, BookOpen, Award,
  TrendingUp, ArrowRight, Star, ChevronRight
} from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function MetricCard({ emoji, label, value, sub, color, gradient }) {
  return (
    <motion.div variants={item} className="glass rounded-xl p-4 relative overflow-hidden group hover:scale-[1.02] transition-transform">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 ${gradient}`} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-3xl icon-3d icon-bounce bg-slate-50 border border-slate-200 shadow-sm">
          {emoji}
        </div>
        <TrendingUp className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold font-heading">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className={`text-xs mt-1 ${color}`}>{sub}</p>}
    </motion.div>
  );
}

function StreakWeek({ week, done }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
        done ? 'gradient-primary text-white glow-green' : 'bg-secondary text-muted-foreground'
      }`}>
        {done ? '✓' : '○'}
      </div>
      <span className="text-[10px] text-muted-foreground">{week}</span>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'];
  const streakWeeks = weeks.map((_, index) => index < Math.min(user?.streak || 1, weeks.length));
  const activeMissions = mockMissions.filter(m => m.status === 'in_progress').slice(0, 3);
  const recentTopics = mockTopics.slice(0, 4);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-2xl glow-green">
            {user?.avatar || '🌿'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name || 'Student'}</h1>
            <p className="text-sm text-muted-foreground">
              Class {user?.className || '8-A'} • {user?.schoolName || 'Green Valley School'}
            </p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-eco-amber/10 text-eco-amber text-sm font-medium flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" /> Level {user?.level || 12}
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard emoji="⚡" label="Eco Points" value={formatNumber(user?.points || 2450)} sub="+180 this week" color="text-eco-green" gradient="bg-eco-green" />
        <MetricCard emoji="🔥" label="Weekly Streak" value={`${user?.streak || 1} Weeks`} sub="Streak is active!" color="text-eco-orange" gradient="bg-eco-orange" />
        <MetricCard emoji="🏆" label="Class Rank" value={`#${user?.classRank || 7}`} sub="↑ 1 position" color="text-eco-blue" gradient="bg-eco-blue" />
        <MetricCard emoji="🏫" label="School Rank" value={`#${user?.schoolRank || 24}`} sub="↑ 3 positions" color="text-eco-purple" gradient="bg-purple-500" />
      </motion.div>

      {/* Streak Visual */}
      <motion.div variants={item} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-xl icon-3d icon-bounce">🔥</span> Weekly Streak
          </h3>
          <span className="text-sm text-eco-orange font-medium">{user?.streak || 1} weeks</span>
        </div>
        <div className="flex justify-between">
          {weeks.map((week, i) => (
            <StreakWeek key={week} week={week} done={streakWeeks[i]} />
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Active Missions */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-eco-green" /> Active Missions
            </h3>
            <Link to="/student/missions" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeMissions.map(mission => (
              <div key={mission.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${mission.color}20` }}>
                  {mission.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{mission.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(mission.progress / mission.total) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: mission.color }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{mission.progress}/{mission.total}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-eco-green font-medium">+{mission.points}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Learning Progress */}
        <motion.div variants={item} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-eco-blue" /> Learning Progress
            </h3>
            <Link to="/student/learn" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTopics.map(topic => (
              <div key={topic.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <span className="text-xl">{topic.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{topic.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: topic.color }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{topic.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Green Score */}
      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-eco-gold" /> Green Score
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Learning', score: mockGreenScore.learningScore, color: '#3b82f6' },
            { label: 'Missions', score: mockGreenScore.missionScore, color: '#22c55e' },
            { label: 'Verified Actions', score: mockGreenScore.verifiedActionScore, color: '#14b8a6' },
            { label: 'Participation', score: mockGreenScore.participationScore, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="relative w-14 h-14 mx-auto mb-2">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" className="text-secondary" strokeWidth="4" />
                  <motion.circle
                    cx="28" cy="28" r="24" fill="none" stroke={s.color} strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${s.score * 1.508} 150.8`}
                    initial={{ strokeDasharray: '0 150.8' }}
                    animate={{ strokeDasharray: `${s.score * 1.508} 150.8` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{s.score}</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20 col-span-2 lg:col-span-1">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full gradient-primary flex items-center justify-center glow-green">
              <span className="text-lg font-bold text-white">{mockGreenScore.overall}</span>
            </div>
            <p className="text-xs font-medium text-primary">Overall</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/student/quizzes', icon: '🎯', label: 'Take Quiz', color: 'from-green-500/10 to-emerald-500/10' },
          { to: '/student/crossword', icon: '🧩', label: 'Eco Crossword', color: 'from-blue-500/10 to-indigo-500/10' },
          { to: '/student/missions', icon: '🌍', label: 'Start Mission', color: 'from-amber-500/10 to-orange-500/10' },
          { to: '/student/leaderboard', icon: '🏆', label: 'Leaderboard', color: 'from-purple-500/10 to-pink-500/10' },
        ].map(action => (
          <Link key={action.to} to={action.to}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={`p-4 rounded-xl bg-gradient-to-br ${action.color} border border-border hover:border-primary/20 text-center transition-all`}>
              <span className="text-2xl">{action.icon}</span>
              <p className="text-sm font-medium mt-2">{action.label}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
