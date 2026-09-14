import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockCompetitions, mockSchools } from '../../data/mockData';
import { formatNumber } from '../../lib/utils';
import { Trophy, Plus, Calendar, Users, Target, CheckCircle2, X } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const statusColors = {
  active: 'bg-eco-green/10 text-eco-green border-eco-green/20',
  upcoming: 'bg-eco-amber/10 text-eco-amber border-eco-amber/20',
  completed: 'bg-secondary text-muted-foreground border-border',
};

export default function CompetitionsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [competitions, setCompetitions] = useState(mockCompetitions);
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', missions: 10, description: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    setCompetitions([...competitions, {
      id: `comp${competitions.length + 1}`, ...form, schools: 0, students: 0, status: 'upcoming',
    }]);
    setCreated(true);
    setTimeout(() => { setCreated(false); setShowCreate(false); setForm({ name: '', startDate: '', endDate: '', missions: 10, description: '' }); }, 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-eco-gold" /> Competition Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage inter-school environmental competitions</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Competition
        </motion.button>
      </motion.div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Create New Competition</h3>
            <button onClick={() => setShowCreate(false)} className="p-1 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          {created ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-eco-green mx-auto mb-3" />
              <p className="text-lg font-semibold text-eco-green">Competition Created!</p>
            </motion.div>
          ) : (
            <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Competition Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary"
                  placeholder="e.g., National Green Campus Challenge 2026" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">End Date</label>
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Number of Missions</label>
                <input type="number" value={form.missions} onChange={e => setForm({...form, missions: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Participating Schools</label>
                <select className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary">
                  <option>All Schools (128)</option><option>State Level</option><option>District Level</option><option>Custom Selection</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary resize-none"
                  placeholder="Describe the competition..." />
              </div>
              <div className="sm:col-span-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-semibold">
                  Create Competition
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      <motion.div variants={container} className="space-y-4">
        {competitions.map(comp => (
          <motion.div key={comp.id} variants={item} className={`glass rounded-xl p-5 border ${statusColors[comp.status]}`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{comp.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[comp.status]}`}>{comp.status}</span>
                </div>
                {comp.description && <p className="text-xs text-muted-foreground mb-3">{comp.description}</p>}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(comp.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {new Date(comp.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{comp.schools} Schools</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{formatNumber(comp.students)} Students</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" />{comp.missions} Missions</span>
                </div>
              </div>
              {comp.status === 'active' && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium whitespace-nowrap">
                  View Leaderboard
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
