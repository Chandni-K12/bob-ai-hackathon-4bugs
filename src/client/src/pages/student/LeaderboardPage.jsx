import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockClassLeaderboard, mockSchoolLeaderboard, mockCompetitions, mockGreenScore } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Crown, Star, Users } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

function RankBadge({ rank }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
}

function LeaderboardEntry({ entry, index, isCurrentUser }) {
  return (
    <motion.div
      variants={item}
      className={`flex items-center gap-3 p-3 rounded-lg transition ${
        isCurrentUser ? 'bg-primary/10 border border-primary/20' : index < 3 ? 'bg-secondary/80' : 'bg-secondary/30'
      }`}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-secondary shrink-0">
        <RankBadge rank={entry.rank} />
      </div>
      <div className="w-8 text-2xl text-center">{entry.avatar || '🏫'}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-primary' : ''}`}>
          {entry.name} {isCurrentUser && <span className="text-xs text-primary">(You)</span>}
        </p>
        {entry.city && <p className="text-xs text-muted-foreground">{entry.city}</p>}
      </div>
      <div className="text-right">
        <p className="text-sm font-bold">{entry.points?.toLocaleString()}</p>
        {entry.change !== undefined && (
          <div className={`flex items-center justify-end gap-0.5 text-xs ${
            entry.change > 0 ? 'text-eco-green' : entry.change < 0 ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {entry.change > 0 ? <TrendingUp className="w-3 h-3" /> : entry.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {entry.change !== 0 ? Math.abs(entry.change) : '—'}
          </div>
        )}
        {entry.students && <p className="text-xs text-muted-foreground">{entry.students} students</p>}
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('class');
  const [liveUpdate, setLiveUpdate] = useState(null);

  // Simulate live leaderboard update
  useEffect(() => {
    const timer = setTimeout(() => {
      setLiveUpdate({ name: 'Ananya', from: 8, to: 7 });
      setTimeout(() => setLiveUpdate(null), 4000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'class', label: 'Class', icon: Users },
    { id: 'school', label: 'School', icon: Trophy },
    { id: 'competition', label: 'Competition', icon: Star },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6 text-eco-gold" /> Green League
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Compete with classmates and other schools</p>
      </motion.div>

      {/* Live Update Toast */}
      <AnimatePresence>
        {liveUpdate && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="p-3 rounded-xl bg-eco-green/10 border border-eco-green/20 flex items-center gap-2 text-sm">
            <span className="text-lg">🏆</span>
            <p><span className="font-semibold text-eco-green">{liveUpdate.name}</span> moved from #{liveUpdate.from} → #{liveUpdate.to}</p>
            <span className="ml-auto text-xs text-eco-green px-2 py-0.5 rounded-full bg-eco-green/10">LIVE</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <motion.div variants={item} className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition ${
              tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </motion.div>

      {/* Green Score Section */}
      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-eco-amber" /> Green Score Breakdown
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Learning', score: mockGreenScore.learningScore, color: '#3b82f6' },
            { label: 'Missions', score: mockGreenScore.missionScore, color: '#22c55e' },
            { label: 'Verified', score: mockGreenScore.verifiedActionScore, color: '#14b8a6' },
            { label: 'Participation', score: mockGreenScore.participationScore, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.score}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Overall Green Score:</span>
          <span className="text-xl font-bold text-gradient">{mockGreenScore.overall}</span>
        </div>
      </motion.div>

      {/* Leaderboard List */}
      <motion.div variants={container} className="space-y-2">
        {tab === 'class' && mockClassLeaderboard.sort((a, b) => a.rank - b.rank).map((entry, i) => (
          <LeaderboardEntry key={entry.name} entry={entry} index={i} isCurrentUser={entry.name === user?.name} />
        ))}
        {tab === 'school' && mockSchoolLeaderboard.map((entry, i) => (
          <LeaderboardEntry key={entry.name} entry={entry} index={i} isCurrentUser={entry.name === user?.schoolName} />
        ))}
        {tab === 'competition' && (
          <div className="space-y-3">
            {mockCompetitions.filter(c => c.status === 'active' || c.status === 'upcoming').map((comp, i) => (
              <motion.div key={comp.id} variants={item} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{comp.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    comp.status === 'active' ? 'bg-eco-green/10 text-eco-green' : 'bg-eco-amber/10 text-eco-amber'
                  }`}>{comp.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{comp.description}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-lg font-bold">{comp.schools}</p><p className="text-[10px] text-muted-foreground">Schools</p></div>
                  <div><p className="text-lg font-bold">{comp.students.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">Students</p></div>
                  <div><p className="text-lg font-bold">{comp.missions}</p><p className="text-[10px] text-muted-foreground">Missions</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
