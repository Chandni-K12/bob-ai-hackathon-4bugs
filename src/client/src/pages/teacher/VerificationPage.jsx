import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockSubmissions } from '../../data/mockData';
import { Shield, CheckCircle2, XCircle, Eye, MapPin, Clock, Image, X } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function VerificationPage() {
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [viewSub, setViewSub] = useState(null);
  const [filter, setFilter] = useState('pending');

  const handleApprove = (id) => {
    setSubmissions(subs => subs.map(s => s.id === id ? { ...s, teacherApproval: 'approved', status: 'approved', pointsAwarded: 100 } : s));
    setViewSub(null);
  };

  const handleReject = (id) => {
    setSubmissions(subs => subs.map(s => s.id === id ? { ...s, teacherApproval: 'rejected', status: 'rejected' } : s));
    setViewSub(null);
  };

  const filtered = submissions.filter(s => {
    if (filter === 'pending') return s.status === 'awaiting_approval';
    if (filter === 'approved') return s.status === 'approved';
    if (filter === 'rejected') return s.status === 'rejected';
    return true;
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-eco-teal" /> Pending AI Verifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve AI-verified student submissions</p>
      </motion.div>

      <motion.div variants={item} className="flex gap-2">
        {[{ id: 'pending', label: 'Pending' }, { id: 'approved', label: 'Approved' }, { id: 'rejected', label: 'Rejected' }, { id: 'all', label: 'All' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${filter === f.id ? 'bg-eco-teal text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            {f.label} ({submissions.filter(s => f.id === 'all' ? true : f.id === 'pending' ? s.status === 'awaiting_approval' : s.status === f.id).length})
          </button>
        ))}
      </motion.div>

      <motion.div variants={container} className="space-y-3">
        {filtered.map(sub => (
          <motion.div key={sub.id} variants={item} className="glass rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{sub.studentName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    sub.status === 'awaiting_approval' ? 'bg-eco-amber/10 text-eco-amber' :
                    sub.status === 'approved' ? 'bg-eco-green/10 text-eco-green' : 'bg-destructive/10 text-destructive'
                  }`}>{sub.status === 'awaiting_approval' ? 'Awaiting Approval' : sub.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">{sub.missionTitle}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{sub.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(sub.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {sub.detectedItems.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sub.detectedItems.map((item, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{item}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">AI Confidence</p>
                  <p className={`text-2xl font-bold ${sub.aiConfidence >= 85 ? 'text-eco-green' : sub.aiConfidence >= 70 ? 'text-eco-amber' : 'text-destructive'}`}>
                    {sub.aiConfidence}%
                  </p>
                </div>
                {sub.status === 'awaiting_approval' && (
                  <div className="flex gap-2">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleApprove(sub.id)}
                      className="px-3 py-1.5 rounded-lg bg-eco-green/10 text-eco-green text-xs font-medium hover:bg-eco-green/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleReject(sub.id)}
                      className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </motion.button>
                    <button onClick={() => setViewSub(sub)}
                      className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-xs font-medium hover:text-foreground flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewSub && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewSub(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()} className="glass rounded-2xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">AI-Assisted Verification</h3>
                <button onClick={() => setViewSub(null)} className="p-1 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm"><span className="text-muted-foreground">Student:</span> <span className="font-medium">{viewSub.studentName}</span></p>
                <p className="text-sm mt-1"><span className="text-muted-foreground">Mission:</span> <span className="font-medium">{viewSub.missionTitle}</span></p>
                <p className="text-sm mt-1"><span className="text-muted-foreground">Location:</span> {viewSub.location}</p>
              </div>
              <div className="space-y-2">
                {['✓ Activity detected', '✓ Evidence received', '✓ Image appears relevant'].map((t, i) => (
                  <p key={i} className="text-sm text-eco-green">{t}</p>
                ))}
              </div>
              <div className="text-center p-4 rounded-xl bg-eco-green/5 border border-eco-green/20">
                <p className="text-xs text-muted-foreground">Verification Confidence</p>
                <p className="text-4xl font-bold text-eco-green">{viewSub.aiConfidence}%</p>
              </div>
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleApprove(viewSub.id)}
                  className="flex-1 py-3 rounded-xl bg-eco-green text-white font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleReject(viewSub.id)}
                  className="flex-1 py-3 rounded-xl bg-destructive text-white font-semibold flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Reject
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
