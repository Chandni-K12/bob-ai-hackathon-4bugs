import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Target, Loader2, WifiOff, Inbox, RefreshCw, Users } from 'lucide-react';
import { aiAPI } from '../../services/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

// Map action priority → visual style (reuses existing design tokens)
const priorityConfig = {
  high:   { color: 'border-eco-amber',  bg: 'bg-eco-amber/5',  icon: AlertTriangle, iconColor: 'text-eco-amber',  label: 'High Priority' },
  medium: { color: 'border-eco-blue',   bg: 'bg-eco-blue/5',   icon: TrendingUp,    iconColor: 'text-eco-blue',   label: 'Medium Priority' },
  low:    { color: 'border-eco-teal',   bg: 'bg-eco-teal/5',   icon: Target,        iconColor: 'text-eco-teal',   label: 'Low Priority' },
};

const CLASSES = [
  { id: 'c1', name: 'Class 8-A' },
  { id: 'c2', name: 'Class 8-B' },
  { id: 'c3', name: 'Class 9-A' },
];

export default function InsightsPage() {
  const [selectedClass, setSelectedClass] = useState('c1');
  const [actions, setActions]             = useState([]);
  const [classSummary, setClassSummary]   = useState(null);
  const [dataStatus, setDataStatus]       = useState(null); // null = loading
  const [error, setError]                 = useState(null);
  const [isRefreshing, setIsRefreshing]   = useState(false);

  const fetchInsights = useCallback((classId) => {
    setDataStatus(null);
    setError(null);
    setIsRefreshing(true);
    aiAPI.getClassInsights(classId)
      .then(res => {
        setActions(res.data.actions ?? []);
        setClassSummary({
          className: res.data.class_name || (CLASSES.find(c => c.id === classId)?.name ?? 'Class 8-A'),
          topicScores: res.data.topic_avg_scores || [],
          pendingCount: res.data.pending_verification_count ?? 2,
          trend: res.data.participation_trend || [],
        });
        setDataStatus(res.data.data_status);
      })
      .catch(() => {
        setDataStatus('unavailable');
        setError('Could not reach the AI service.');
      })
      .finally(() => setIsRefreshing(false));
  }, []);

  useEffect(() => {
    fetchInsights(selectedClass);
  }, [selectedClass, fetchInsights]);

  const isLoading      = dataStatus === null;
  const isUnavailable  = dataStatus === 'unavailable';
  const isInsufficient = dataStatus === 'insufficient';
  const isEmpty        = dataStatus === 'sufficient' && actions.length === 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-eco-purple" /> AI Class Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-generated insights based on real-time class performance data</p>
        </div>

        {/* Dynamic Class Selector & Regenerate Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary border border-border">
            <Users className="w-4 h-4 text-eco-purple" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-sm font-semibold outline-none cursor-pointer"
            >
              {CLASSES.map(c => (
                <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchInsights(selectedClass)}
            disabled={isRefreshing}
            className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Regenerate AI Analysis
          </motion.button>
        </div>
      </motion.div>

      {/* Banner */}
      <motion.div variants={item} className="p-4 rounded-xl bg-eco-purple/5 border border-eco-purple/20 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-eco-purple shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-eco-purple">Real-Time AI Class Reasoning</p>
          <p className="text-xs text-muted-foreground mt-1">
            These insights dynamically analyze class-wide performance data, pending verifications,
            quiz accuracy, and participation trends to provide prioritized action items.
          </p>
        </div>
      </motion.div>

      {/* Dynamic Class Analytics Summary Card */}
      {classSummary && !isLoading && (
        <motion.div variants={item} className="glass rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2.5">
            <h3 className="font-bold text-sm flex items-center gap-2">
              📊 Live Class Metrics — {classSummary.className}
            </h3>
            <span className="text-[11px] text-eco-green bg-eco-green/10 px-2 py-0.5 rounded-full font-semibold">
              Live AI Data
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-[11px] text-muted-foreground font-medium">Pending Verifications</p>
              <p className="text-xl font-bold text-eco-amber mt-0.5">{classSummary.pendingCount}</p>
            </div>
            {classSummary.topicScores.map((t, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-secondary/50">
                <p className="text-[11px] text-muted-foreground font-medium truncate">{t.topic}</p>
                <p className={`text-xl font-bold mt-0.5 ${t.avg_score < 60 ? 'text-destructive' : t.avg_score < 80 ? 'text-eco-amber' : 'text-eco-green'}`}>
                  {t.avg_score}%
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Loading state ── */}
      {isLoading && (
        <motion.div variants={item} className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-eco-purple" />
          <p className="text-sm">Generating insights…</p>
        </motion.div>
      )}

      {/* ── Unavailable state ── */}
      {isUnavailable && (
        <motion.div variants={item} className="glass rounded-xl p-6 flex items-start gap-4 border border-destructive/20 bg-destructive/5">
          <WifiOff className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">AI Insights Unavailable</p>
            <p className="text-xs text-muted-foreground mt-1">
              {error ?? 'IBM Bob could not be reached. Please check your credentials and try again shortly.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Insufficient data state ── */}
      {isInsufficient && (
        <motion.div variants={item} className="glass rounded-xl p-6 flex items-start gap-4 border border-eco-amber/20 bg-eco-amber/5">
          <AlertTriangle className="w-6 h-6 text-eco-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-eco-amber">Not Enough Data Yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              There isn't enough class activity data to generate meaningful insights. Check back once more students have completed missions and quizzes.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Empty state (sufficient but Bob returned zero actions) ── */}
      {isEmpty && (
        <motion.div variants={item} className="glass rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground">
          <Inbox className="w-10 h-10" />
          <p className="text-sm">No actions recommended right now — your class is on track!</p>
        </motion.div>
      )}

      {/* ── Actions list ── */}
      {!isLoading && actions.length > 0 && (
        <motion.div variants={container} className="space-y-4">
          {actions.map((action, i) => {
            const cfg = priorityConfig[action.priority] ?? priorityConfig.medium;
            return (
              <motion.div key={i} variants={item}
                className={`glass rounded-xl p-5 border-l-4 ${cfg.color} ${cfg.bg}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <cfg.icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium uppercase tracking-wider ${cfg.iconColor}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mb-1">{action.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{action.reason}</p>
                    <div className="mt-2 p-3 rounded-lg bg-background/60 border border-border/40">
                      <p className="text-xs font-medium text-foreground">→ {action.recommended_action}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
