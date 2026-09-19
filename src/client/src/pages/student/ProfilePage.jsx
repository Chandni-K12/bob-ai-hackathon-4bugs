import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { formatNumber } from '../../lib/utils';
import { dashboardAPI, badgesAPI, topicsAPI } from '../../services/api';
import { User, Star, Zap, Flame, Trophy, School, Award, Target, BookOpen, BarChart3, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const fallbackBadges = [
  { id: 'b1', name: 'Eco Starter', icon: '🌱', description: 'Complete your first lesson', unlocked: true, unlockedDate: '2026-07-15', color: '#22c55e' },
  { id: 'b2', name: 'Waste Warrior', icon: '♻️', description: 'Complete waste activities', unlocked: true, unlockedDate: '2026-07-22', color: '#10b981' },
  { id: 'b3', name: 'Water Guardian', icon: '💧', description: 'Save 100L of water', unlocked: true, unlockedDate: '2026-07-30', color: '#3b82f6' },
  { id: 'b4', name: 'Eco Master', icon: '🏆', description: 'Reach Level 15', unlocked: false, color: '#eab308' },
];

const fallbackTopics = [
  { id: 'tp1', name: 'Climate', progress: 70 },
  { id: 'tp2', name: 'Waste', progress: 72 },
  { id: 'tp3', name: 'Water', progress: 50 },
  { id: 'tp4', name: 'Biodiversity', progress: 42 },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(user || { name: 'Student', points: 0, streak: 0, level: 1 });
  const [badges, setBadges] = useState(fallbackBadges);
  const [topics, setTopics] = useState(fallbackTopics);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;
    dashboardAPI.getStudent(user.id)
      .then((res) => {
        if (!active) return;
        setProfile({ ...user, ...(res.data || {}) });
      })
      .catch(() => {
        if (active) setProfile({ ...user, className: user.className || '8-A', schoolName: user.schoolName || 'Green Valley School' });
      });

    badgesAPI.getAll()
      .then((res) => {
        if (!active) return;
        const next = (res.data || []).map((badge, index) => ({
          ...badge,
          id: badge.id || `b-${index + 1}`,
          name: badge.name || `Badge ${index + 1}`,
          icon: badge.icon || '🏅',
          description: badge.description || 'Earn this achievement',
          unlocked: Boolean(badge.unlocked),
          color: badge.color || ['#22c55e', '#10b981', '#3b82f6', '#eab308'][index % 4],
        }));
        if (next.length) setBadges(next);
      })
      .catch(() => {
        if (active) setBadges(fallbackBadges);
      });

    topicsAPI.getAll()
      .then((res) => {
        if (!active) return;
        const next = (res.data || []).slice(0, 4).map((topic, index) => ({
          id: topic.id || `tp-${index + 1}`,
          name: (topic.name || 'Topic').split(' ')[0],
          progress: Number(topic.progress || 0),
        }));
        if (next.length) setTopics(next);
      })
      .catch(() => {
        if (active) setTopics(fallbackTopics);
      });

    return () => {
      active = false;
    };
  }, [user?.id, user?.className, user?.schoolName]);

  const unlockedBadges = badges.filter((badge) => badge.unlocked).slice(0, 6);

  const radarData = [
    { subject: 'Learning', A: 78 },
    { subject: 'Missions', A: 82 },
    { subject: 'Verified', A: 76 },
    { subject: 'Participation', A: 88 },
    { subject: 'Quizzes', A: user?.quizAccuracy || 84 },
  ];

  const topicData = topics.map((t) => ({ name: t.name.split(' ')[0], progress: Number(t.progress || 0) }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item} className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 gradient-primary" />
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-4xl glow-green">
            {profile?.avatar || user?.avatar || '🌿'}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{profile?.name || user?.name || 'Student'}</h1>
            <p className="text-muted-foreground text-sm">Class {profile?.className || user?.className || '8-A'} • {profile?.schoolName || user?.schoolName || 'Green Valley School'}</p>
            <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start">
              <span className="px-3 py-1 rounded-full bg-eco-amber/10 text-eco-amber text-sm font-medium flex items-center gap-1">
                <Star className="w-3.5 h-3.5" /> Level {profile?.level || user?.level || 12}
              </span>
              <span className="px-3 py-1 rounded-full bg-eco-green/10 text-eco-green text-sm font-medium">
                {formatNumber(profile?.points || user?.points || 2450)} Eco Points
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Trophy, label: 'Class Rank', value: `#${profile?.classRank || user?.classRank || 7}`, color: 'text-eco-blue' },
          { icon: School, label: 'School Rank', value: `#${profile?.schoolRank || user?.schoolRank || 24}`, color: 'text-eco-purple' },
          { icon: Flame, label: 'Streak', value: `${profile?.streak || user?.streak || 1} weeks`, color: 'text-eco-orange' },
          { icon: Award, label: 'Badges', value: profile?.badges || user?.badges || 12, color: 'text-eco-gold' },
          { icon: Target, label: 'Missions', value: profile?.completedMissions || user?.completedMissions || 28, color: 'text-eco-green' },
          { icon: BarChart3, label: 'Quiz Accuracy', value: `${profile?.quizAccuracy || user?.quizAccuracy || 84}%`, color: 'text-eco-teal' },
          { icon: BookOpen, label: 'Learning', value: `${profile?.learningProgress || user?.learningProgress || 76}%`, color: 'text-eco-blue' },
          { icon: Zap, label: 'Eco Points', value: formatNumber(profile?.points || user?.points || 2450), color: 'text-eco-green' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={item} className="glass rounded-xl p-3 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-eco-teal" /> Performance Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Score" dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="glass rounded-xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-eco-blue" /> Topic Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topicData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10 }} width={70} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
              <Bar dataKey="progress" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Award className="w-5 h-5 text-eco-gold" /> Recent Badges</h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {unlockedBadges.map((badge) => (
            <div key={badge.id} className="text-center p-2 rounded-lg bg-secondary/50">
              <span className="text-2xl">{badge.icon}</span>
              <p className="text-[10px] font-medium mt-1 truncate">{badge.name}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">🌍 Eco Journey</h3>
        <div className="flex items-center justify-between overflow-x-auto scrollbar-hide gap-2">
          {['Lessons', 'Quizzes', 'Missions', 'AI Verify', 'Rewards', 'Compete'].map((step, i) => (
            <div key={step} className="flex items-center shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-medium ${
                i <= 4 ? 'gradient-primary text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                {['📖', '🎯', '🌱', '🤖', '🏆', '⚔️'][i]}
              </div>
              {i < 5 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
