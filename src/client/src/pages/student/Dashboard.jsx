import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { formatNumber } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { tasksAPI, dashboardAPI, topicsAPI, missionsAPI, leaderboardsAPI } from '../../services/api';
import { Target, BookOpen, Award, TrendingUp, Star, ChevronRight, ClipboardList } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const fallbackTopics = [
  { id: 'tp1', name: 'Climate Change', icon: '🌡️', description: 'Understanding global warming and climate action', difficulty: 'Intermediate', lessons: 10, completedLessons: 7, progress: 70, quizAvailable: true, points: 150, estimatedTime: '4 hrs', color: '#ef4444' },
  { id: 'tp2', name: 'Waste Management', icon: '♻️', description: 'Learn about segregation, recycling, and composting', difficulty: 'Beginner', lessons: 8, completedLessons: 6, progress: 72, quizAvailable: true, points: 100, estimatedTime: '3 hrs', color: '#22c55e' },
  { id: 'tp3', name: 'Water Conservation', icon: '💧', description: 'Water cycle and conservation methods', difficulty: 'Intermediate', lessons: 8, completedLessons: 4, progress: 50, quizAvailable: true, points: 120, estimatedTime: '3.5 hrs', color: '#3b82f6' },
  { id: 'tp4', name: 'Biodiversity', icon: '🦋', description: 'Flora, fauna, and ecosystem protection', difficulty: 'Advanced', lessons: 12, completedLessons: 5, progress: 42, quizAvailable: false, points: 200, estimatedTime: '5 hrs', color: '#a855f7' },
];

const fallbackMissions = [
  { id: 'm2', title: 'Water Saver', icon: '💧', description: 'Track and reduce water usage', topic: 'Water Conservation', difficulty: 'Easy', points: 75, progress: 3, total: 5, deadline: '2026-08-23', verificationRequired: true, status: 'in_progress', color: '#3b82f6' },
  { id: 'm5', title: 'Plant a Tree', icon: '🌳', description: 'Plant a tree and document its growth', topic: 'Biodiversity', difficulty: 'Hard', points: 200, progress: 0, total: 1, deadline: '2026-09-05', verificationRequired: true, status: 'not_started', color: '#16a34a' },
  { id: 'm6', title: 'Biodiversity Explorer', icon: '🔍', description: 'Document species in your local area', topic: 'Biodiversity', difficulty: 'Hard', points: 150, progress: 6, total: 10, deadline: '2026-09-10', verificationRequired: true, status: 'in_progress', color: '#a855f7' },
];

const defaultAssigned = [
  { id: 't1', classId: '8-A', envTopic: 'Water Conservation', task: 'Water Conservation Scenario Quiz', deadline: '2026-08-25', points: 100, status: 'assigned' },
  { id: 't2', classId: '8-A', envTopic: 'Biodiversity', task: 'Biodiversity Explorer Mission', deadline: '2026-08-28', points: 150, status: 'in_progress' },
];

const normalizeTopic = (topic, index) => ({
  id: topic.id || `tp-${index + 1}`,
  name: topic.name || 'Topic',
  icon: topic.icon || ['🌡️', '♻️', '💧', '🦋'][index % 4],
  description: topic.description || `${topic.name || 'Environmental'} topic overview`,
  difficulty: topic.difficulty || 'Beginner',
  lessons: Number(topic.lessons || 6),
  completedLessons: Number(topic.completedLessons || 0),
  progress: Number(topic.progress || 0),
  quizAvailable: Boolean(topic.quizAvailable ?? true),
  points: Number(topic.points || 100),
  estimatedTime: topic.estimatedTime || '2 hrs',
  color: topic.color || ['#ef4444', '#22c55e', '#3b82f6', '#a855f7'][index % 4],
});

const normalizeMission = (mission, index) => ({
  id: mission.id || `m-${index + 1}`,
  title: mission.title || 'Mission',
  icon: mission.icon || '🌿',
  description: mission.description || 'Environmental mission',
  topic: mission.topic || 'Sustainability',
  difficulty: mission.difficulty || 'Medium',
  points: Number(mission.points || 0),
  progress: Number(mission.progress || 0),
  total: Number(mission.total || 1),
  deadline: mission.deadline || null,
  verificationRequired: Boolean(mission.verificationRequired ?? true),
  status: mission.status || 'in_progress',
  color: mission.color || ['#22c55e', '#3b82f6', '#a855f7'][index % 3],
});

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
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${done ? 'gradient-primary text-white glow-green' : 'bg-secondary text-muted-foreground'}`}>
        {done ? '✓' : '○'}
      </div>
      <span className="text-[10px] text-muted-foreground">{week}</span>
    </div>
  );
}

// Dynamic routing helper based on task type/title
const getTaskRoute = (t) => {
  const text = `${t.task || ''} ${t.envTopic || ''} ${t.syllabus || ''}`.toLowerCase();
  if (text.includes('quiz') || text.includes('scenario')) {
    return '/student/quizzes';
  }
  if (text.includes('crossword')) {
    return '/student/crossword';
  }
  if (text.includes('learn') || text.includes('lesson')) {
    return '/student/learn';
  }
  return '/student/missions';
};

const getTaskIcon = (t) => {
  const route = getTaskRoute(t);
  if (route === '/student/quizzes') return '🎯';
  if (route === '/student/crossword') return '🧩';
  if (route === '/student/learn') return '📖';
  return '📋';
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [activeMissions, setActiveMissions] = useState(fallbackMissions);
  const [recentTopics, setRecentTopics] = useState(fallbackTopics.slice(0, 4));
  const [assignedTasks, setAssignedTasks] = useState(defaultAssigned);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    const classId = user.classId || user.class_id || user.className || '8-A';
    const schoolId = user.schoolId || user.school_id || user.schoolName || 's1';

    const loadDashboard = async () => {
      try {
        const [studentRes, classBoardRes, schoolBoardRes] = await Promise.all([
          dashboardAPI.getStudent(user.id),
          leaderboardsAPI.getClass(classId),
          leaderboardsAPI.getSchool(schoolId),
        ]);

        if (!active) return;

        const studentData = studentRes.data || {};
        const classRows = classBoardRes.data || [];
        const schoolRows = schoolBoardRes.data || [];

        const classRank = classRows.findIndex((entry) => entry.name === studentData.name) + 1 || undefined;
        const schoolRank = schoolRows.findIndex((entry) => entry.name === studentData.name) + 1 || undefined;

        setDashboard({
          ...user,
          ...studentData,
          classRank: classRank || Number(user.classRank ?? 0) || undefined,
          schoolRank: schoolRank || Number(user.schoolRank ?? 0) || undefined,
        });
      } catch {
        if (!active) return;
        setDashboard({
          ...user,
          className: user.className || '8-A',
          schoolName: user.schoolName || 'Green Valley School',
          classRank: Number(user.classRank ?? 7),
          schoolRank: Number(user.schoolRank ?? 24),
        });
      }
    };

    loadDashboard();

    topicsAPI.getAll()
      .then((res) => {
        if (!active) return;
        const items = (res.data || []).map(normalizeTopic);
        if (items.length) setRecentTopics(items.slice(0, 4));
      })
      .catch(() => {
        if (active) setRecentTopics(fallbackTopics.slice(0, 4));
      });

    missionsAPI.getAll()
      .then((res) => {
        if (!active) return;
        const items = (res.data || []).map(normalizeMission).filter((mission) => mission.status !== 'completed');
        if (items.length) setActiveMissions(items.slice(0, 3));
      })
      .catch(() => {
        if (active) setActiveMissions(fallbackMissions);
      });

    tasksAPI.getByClass(classId)
      .then((res) => {
        if (!active) return;
        const live = (res.data || []).filter((task) => task.status !== 'completed').slice(0, 3);
        if (live.length) setAssignedTasks(live);
      })
      .catch(() => {
        if (active) setAssignedTasks(defaultAssigned);
      });

    return () => {
      active = false;
    };
  }, [user?.id, user?.classId, user?.class_id, user?.className, user?.schoolId, user?.school_id, user?.schoolName]);

  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'];
  const streakWeeks = weeks.map((_, index) => index < Math.min(Number(dashboard?.streak ?? user?.streak ?? 0), weeks.length));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-2xl glow-green">
            {dashboard?.avatar || user?.avatar || '🌿'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{dashboard?.name ?? user?.name ?? 'Student'}</h1>
            <p className="text-sm text-muted-foreground">Class {dashboard?.className ?? user?.className ?? '8-A'} • {dashboard?.schoolName ?? user?.schoolName ?? 'Green Valley School'}</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-eco-amber/10 text-eco-amber text-sm font-medium flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" /> Level {dashboard?.level ?? user?.level ?? 1}
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard emoji="⚡" label="Eco Points" value={formatNumber(dashboard?.points ?? user?.points ?? 0)} sub={(dashboard?.points ?? user?.points) > 0 ? '+180 this week' : 'Start earning!'} color="text-eco-green" gradient="bg-eco-green" />
        <MetricCard emoji="🔥" label="Weekly Streak" value={`${dashboard?.streak ?? user?.streak ?? 0} Weeks`} sub={(dashboard?.streak ?? user?.streak) > 0 ? 'Streak is active!' : 'Complete activities!'} color="text-eco-orange" gradient="bg-eco-orange" />
        <MetricCard emoji="🏆" label="Class Rank" value={(dashboard?.classRank ?? user?.classRank) ? `#${dashboard?.classRank ?? user?.classRank}` : 'Unranked'} sub={(dashboard?.classRank ?? user?.classRank) ? '↑ 1 position' : 'Earn points to rank'} color="text-eco-blue" gradient="bg-eco-blue" />
        <MetricCard emoji="🏫" label="School Rank" value={(dashboard?.schoolRank ?? user?.schoolRank) ? `#${dashboard?.schoolRank ?? user?.schoolRank}` : 'Unranked'} sub={(dashboard?.schoolRank ?? user?.schoolRank) ? '↑ 3 positions' : 'Keep going!'} color="text-eco-purple" gradient="bg-purple-500" />
      </motion.div>

      <motion.div variants={item} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><span className="text-xl icon-3d icon-bounce">🔥</span> Weekly Streak</h3>
          <span className="text-sm text-eco-orange font-medium">{dashboard?.streak ?? user?.streak ?? 0} weeks</span>
        </div>
        <div className="flex justify-between">
          {weeks.map((week, i) => (
            <StreakWeek key={week} week={week} done={streakWeeks[i]} />
          ))}
        </div>
      </motion.div>

      {/* Teacher-Assigned Tasks — dynamically routes to quiz, crossword, or mission page */}
      {assignedTasks.length > 0 && (
        <motion.div variants={item} className="glass rounded-xl p-5 border-l-4 border-eco-blue">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-eco-blue" /> Tasks Assigned by Teacher
            </h3>
            <Link to="/student/missions" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {assignedTasks.map(t => {
              const targetRoute = getTaskRoute(t);
              const taskIcon = getTaskIcon(t);
              const linkUrl = `${targetRoute}?id=${encodeURIComponent(t.id)}&title=${encodeURIComponent(t.task || '')}`;
              return (
                <Link
                  key={t.id}
                  to={linkUrl}
                  className="flex items-center gap-3 p-3 rounded-xl bg-eco-blue/5 border border-eco-blue/10 hover:border-eco-blue/30 hover:bg-eco-blue/10 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-eco-blue/10 group-hover:scale-105 transition-transform flex items-center justify-center text-lg shrink-0">
                    {taskIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-eco-blue transition-colors">{t.task}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.envTopic}{t.deadline ? ` · Due ${new Date(t.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : ''}</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="text-xs text-eco-green font-medium">+{t.points} pts</p>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full capitalize font-semibold shadow-xs flex items-center gap-1 group-hover:scale-105 transition-all ${
                      t.status === 'overdue'
                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                        : 'bg-eco-blue text-white hover:bg-eco-blue/90 shadow-sm'
                    }`}>
                      {t.status.replace('_', ' ')} <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        <motion.div variants={item} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-eco-green" /> Active Missions
            </h3>
            <Link to="/student/missions" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {activeMissions.map(mission => {
              const linkUrl = `/student/missions?id=${encodeURIComponent(mission.id)}&title=${encodeURIComponent(mission.title || '')}`;
              return (
                <Link
                  key={mission.id}
                  to={linkUrl}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 hover:border-primary/20 transition-all border border-transparent group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform" style={{ background: `${mission.color}20` }}>
                    {mission.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{mission.title}</p>
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
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <p className="text-xs text-eco-green font-medium">+{mission.points} pts</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-eco-green/10 text-eco-green font-semibold flex items-center gap-0.5 group-hover:bg-eco-green group-hover:text-white transition-all">
                      Continue <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-eco-blue" /> Learning Progress
            </h3>
            <Link to="/student/learn" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentTopics.map(topic => (
              <Link
                key={topic.id}
                to="/student/learn"
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 hover:border-eco-blue/20 transition-all border border-transparent group cursor-pointer"
              >
                <span className="text-xl group-hover:scale-105 transition-transform">{topic.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-eco-blue transition-colors">{topic.name}</p>
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
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-eco-gold" /> Green Score</h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Learning', score: 78, color: '#3b82f6' },
            { label: 'Missions', score: 82, color: '#22c55e' },
            { label: 'Verified Actions', score: 76, color: '#14b8a6' },
            { label: 'Participation', score: 88, color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="relative w-14 h-14 mx-auto mb-2">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" className="text-secondary" strokeWidth="4" />
                  <motion.circle cx="28" cy="28" r="24" fill="none" stroke={s.color} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${s.score * 1.508} 150.8`} initial={{ strokeDasharray: '0 150.8' }} animate={{ strokeDasharray: `${s.score * 1.508} 150.8` }} transition={{ duration: 1.5, delay: 0.5 }} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{s.score}</span>
              </div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20 col-span-2 lg:col-span-1">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full gradient-primary flex items-center justify-center glow-green">
              <span className="text-lg font-bold text-white">{Math.min(100, Math.round(((dashboard?.points ?? user?.points ?? 2450) / 3000) * 100))}</span>
            </div>
            <p className="text-xs font-medium text-primary">Overall</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/student/quizzes', icon: '🎯', label: 'Take Quiz', color: 'from-green-500/10 to-emerald-500/10' },
          { to: '/student/crossword', icon: '🧩', label: 'Eco Crossword', color: 'from-blue-500/10 to-indigo-500/10' },
          { to: '/student/missions', icon: '🌍', label: 'Start Mission', color: 'from-amber-500/10 to-orange-500/10' },
          { to: '/student/leaderboard', icon: '🏆', label: 'Leaderboard', color: 'from-purple-500/10 to-pink-500/10' },
        ].map((action) => (
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

