import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockBadges } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { Award, Lock, X, Sparkles } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } };

// Dynamic badge unlock thresholds based on points
const BADGE_THRESHOLDS = {
  b1: 1,      // Eco Starter — any points
  b2: 100,    // Waste Warrior
  b3: 200,    // Water Guardian
  b4: 400,    // Green Champion
  b5: 600,    // Climate Hero
  b6: 800,    // 7-Week Streak
  b7: 3000,   // Eco Master
  b8: 500,    // Quiz Champion
  b9: 1000,   // Mission Master
  b10: 300,   // Team Player
  b11: 700,   // Biodiversity Scout
  b12: 900,   // Energy Saver
  b13: 1500,  // Pollution Fighter
  b14: 2500,  // Eco Leader
};

export default function BadgesPage() {
  const { user } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState(null);
  const userPoints = user?.points ?? 0;

  // Dynamically compute which badges are unlocked based on user's points
  const badges = mockBadges.map(b => ({
    ...b,
    unlocked: userPoints >= (BADGE_THRESHOLDS[b.id] ?? Infinity),
    unlockedDate: userPoints >= (BADGE_THRESHOLDS[b.id] ?? Infinity) ? (b.unlockedDate || new Date().toISOString()) : null,
  }));

  const unlocked = badges.filter(b => b.unlocked);
  const locked = badges.filter(b => !b.unlocked);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-eco-gold" /> Badges & Achievements
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {unlocked.length} of {badges.length} badges unlocked
        </p>
      </motion.div>

      <motion.div variants={item} className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${(unlocked.length / mockBadges.length) * 100}%` }}
          transition={{ duration: 1.5 }} className="h-full gradient-primary rounded-full" />
      </motion.div>

      {/* Unlocked */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-eco-gold" /> Unlocked ({unlocked.length})
        </h3>
        <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {unlocked.map(badge => (
            <motion.div key={badge.id} variants={item} whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBadge(badge)}
              className="glass rounded-xl p-4 text-center cursor-pointer hover:border-primary/20 transition-all relative overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle, ${badge.color}10 0%, transparent 70%)` }} />
              <motion.div initial={{ rotate: -10 }} animate={{ rotate: 0 }} className="text-4xl mb-2 relative z-10">
                {badge.icon}
              </motion.div>
              <p className="text-sm font-semibold relative z-10">{badge.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 relative z-10">
                {new Date(badge.unlockedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Locked ({locked.length})
          </h3>
          <motion.div variants={container} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {locked.map(badge => (
              <motion.div key={badge.id} variants={item}
                onClick={() => setSelectedBadge(badge)}
                className="glass rounded-xl p-4 text-center opacity-50 cursor-pointer hover:opacity-70 transition">
                <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                <p className="text-sm font-semibold">{badge.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Locked</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBadge(null)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="glass rounded-2xl w-full max-w-sm p-6 text-center">
              <button onClick={() => setSelectedBadge(null)} className="absolute top-3 right-3 p-1 hover:bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                className="text-6xl mb-4 inline-block">
                {selectedBadge.icon}
              </motion.div>
              <h2 className="text-xl font-bold mb-1">{selectedBadge.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{selectedBadge.description}</p>
              {selectedBadge.unlocked ? (
                <div className="p-3 rounded-lg bg-eco-green/10 border border-eco-green/20">
                  <p className="text-sm text-eco-green font-medium">✓ Unlocked</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selectedBadge.unlockedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-sm text-muted-foreground">🔒 Keep going to unlock this badge!</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
