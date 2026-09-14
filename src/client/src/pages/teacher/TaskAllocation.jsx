import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, Calendar, Zap, Plus } from 'lucide-react';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const existingTasks = [
  { id: 1, class: '8-A', syllabus: 'Water Resources', envTopic: 'Water Conservation', task: 'Water Conservation Scenario Quiz', deadline: '2026-08-25', points: 100, status: 'assigned', students: 40, completed: 12 },
  { id: 2, class: '8-A', syllabus: 'Natural Vegetation', envTopic: 'Biodiversity', task: 'Biodiversity Explorer Mission', deadline: '2026-08-28', points: 150, status: 'in_progress', students: 40, completed: 28 },
  { id: 3, class: '8-B', syllabus: 'Minerals', envTopic: 'Renewable Energy', task: 'Energy Audit Assignment', deadline: '2026-08-22', points: 120, status: 'overdue', students: 38, completed: 15 },
  { id: 4, class: '8-A', syllabus: 'Pollution', envTopic: 'Waste Management', task: 'Waste Segregation Challenge', deadline: '2026-08-20', points: 80, status: 'completed', students: 40, completed: 40 },
];

const statusColors = {
  assigned: 'bg-eco-blue/10 text-eco-blue',
  in_progress: 'bg-eco-amber/10 text-eco-amber',
  completed: 'bg-eco-green/10 text-eco-green',
  overdue: 'bg-destructive/10 text-destructive',
};

export default function TaskAllocation() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ class: '8-A', syllabus: '', envTopic: '', task: '', difficulty: 'Medium', deadline: '', points: 100 });
  const [tasks, setTasks] = useState(existingTasks);
  const [assigned, setAssigned] = useState(false);

  const handleAssign = (e) => {
    e.preventDefault();
    setTasks([...tasks, { ...form, id: tasks.length + 1, status: 'assigned', students: 40, completed: 0 }]);
    setAssigned(true);
    setTimeout(() => { setAssigned(false); setShowForm(false); setForm({ class: '8-A', syllabus: '', envTopic: '', task: '', difficulty: 'Medium', deadline: '', points: 100 }); }, 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6 text-eco-blue" /> Syllabus-Wise Task Allocation</h1>
          <p className="text-sm text-muted-foreground mt-1">Assign environmental tasks aligned with the syllabus</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Assign Task
        </motion.button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Assign Environmental Task</h3>
          {assigned ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-eco-green mx-auto mb-3" />
              <p className="text-lg font-semibold text-eco-green">Task Assigned Successfully!</p>
            </motion.div>
          ) : (
            <form onSubmit={handleAssign} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Class</label>
                <select value={form.class} onChange={e => setForm({...form, class: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary">
                  <option>8-A</option><option>8-B</option><option>9-A</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Syllabus Topic</label>
                <select value={form.syllabus} onChange={e => setForm({...form, syllabus: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary">
                  <option value="">Select...</option>
                  <option>Water Resources</option><option>Natural Vegetation</option><option>Minerals</option>
                  <option>Climate</option><option>Pollution</option><option>Agriculture</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Environmental Topic</label>
                <select value={form.envTopic} onChange={e => setForm({...form, envTopic: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary">
                  <option value="">Select...</option>
                  <option>Water Conservation</option><option>Biodiversity</option><option>Waste Management</option>
                  <option>Renewable Energy</option><option>Climate Change</option><option>Pollution</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Task Type</label>
                <select value={form.task} onChange={e => setForm({...form, task: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary">
                  <option value="">Select...</option>
                  <option>Scenario Quiz</option><option>Environmental Mission</option><option>Field Activity</option>
                  <option>Research Assignment</option><option>Eco Crossword</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary">
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Deadline</label>
                <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Eco Points Reward</label>
                <input type="number" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm outline-none focus:border-primary" />
              </div>
              <div className="flex items-end">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold">
                  Assign Task
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {/* Existing Tasks */}
      <motion.div variants={container} className="space-y-3">
        {tasks.map(task => (
          <motion.div key={task.id} variants={item} className="glass rounded-xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary font-medium">Class {task.class}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[task.status]}`}>{task.status.replace('_', ' ')}</span>
                </div>
                <h3 className="font-semibold text-sm">{task.task}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{task.syllabus} → {task.envTopic}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="text-center"><p className="font-medium text-foreground">{task.completed}/{task.students}</p><p>Completed</p></div>
                <div className="text-center"><p className="font-medium text-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(task.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p><p>Deadline</p></div>
                <div className="text-center"><p className="font-medium text-eco-green flex items-center gap-1"><Zap className="w-3 h-3" />+{task.points}</p><p>Points</p></div>
              </div>
            </div>
            {task.status !== 'completed' && (
              <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full" style={{ width: `${(task.completed / task.students) * 100}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
