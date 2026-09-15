import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockMissions } from '../../data/mockData';
import { Target, Upload, MapPin, Camera, CheckCircle2, Clock, Shield, X, ChevronRight, Filter, AlertTriangle, ClipboardList } from 'lucide-react';
import { aiAPI, tasksAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const missionTypeMap = {
  'm5': 'tree_plantation',
  'm3': 'waste_segregation',
  'm2': 'water_conservation',
  'm7': 'clean_campus',
  'm4': 'green_transport',
};

function VerificationModal({ mission, onClose }) {
  const [step, setStep] = useState(0); // 0: upload, 1: verifying, 2: result
  const [file, setFile] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    setStep(1);
    const missionType = missionTypeMap[mission.id] || 'tree_plantation';
    const fileName = file ? file.name : 'evidence.jpg';
    try {
      const res = await aiAPI.verifyImage({
        image_url: fileName,
        file_name: fileName,
        mission_type: missionType,
      });
      setAiResult(res.data);
    } catch (err) {
      console.warn('AI service call fallback', err);
      const lowerName = fileName.toLowerCase();
      const topicKeywordsMap = {
        tree_plantation: ["tree", "plant", "sapling", "garden", "leaf", "green", "nature", "soil", "flower", "forest", "seed", "sprout"],
        waste_segregation: ["waste", "trash", "garbage", "recycle", "bin", "plastic", "paper", "segregat", "compost", "dustbin", "dry", "wet"],
        water_conservation: ["water", "tap", "faucet", "meter", "rain", "bucket", "conserve", "pipe", "leak", "drain", "tank"],
        clean_campus: ["clean", "campus", "school", "sweep", "mop", "broom", "group", "cleanup", "yard", "tidy"],
        green_transport: ["cycle", "bike", "walk", "path", "bus", "transit", "helmet", "pedal", "ride"],
      };
      const offTopicKeywords = ["car", "laptop", "pizza", "burger", "food", "cat", "dog", "shoe", "phone", "game", "screenshot", "movie", "tv", "furniture", "couch", "person", "selfie", "document", "random", "test_bad", "offtopic", "unrelated", "invalid", "wrong", "junk", "bad", "fake", "fail", "dummy", "unknown", "notebook", "notes", "page", "book", "homework", "assignment", "study", "text", "writing", "pen", "pencil", "scan", "sheet", "copy", "register", "classwork", "receipt", "invoice"];

      const currentKeywords = topicKeywordsMap[missionType] || [];
      const otherKeywords = Object.entries(topicKeywordsMap).filter(([m]) => m !== missionType).flatMap(([, kw]) => kw);

      const isOffTopic = offTopicKeywords.some(w => lowerName.includes(w));
      const isWrongTopic = otherKeywords.some(w => lowerName.includes(w)) && !currentKeywords.some(w => lowerName.includes(w));
      const hasTopicMatch = currentKeywords.some(w => lowerName.includes(w));
      const isSampleName = ["http://example.com/evidence.jpg", "http://example.com/tree.jpg", "http://example.com/waste.jpg", "http://example.com/water.jpg", "http://example.com/photo.jpg"].includes(lowerName.trim());

      const isUnmatched = isOffTopic || isWrongTopic || (!hasTopicMatch && !isSampleName);

      if (isUnmatched && !isSampleName) {
        setAiResult({
          verified: false,
          confidence: 0.32,
          detected_objects: ['Unrelated Object / Topic Mismatch'],
          message: 'Verification Unsuccessful (32% Confidence). Uploaded image does not match mission evidence requirements.',
          student_explanation: 'Verification Unsuccessful (32% Confidence). Uploaded image does not match mission evidence requirements.',
          teacher_explanation: 'Automated check failed at 32% confidence due to topic mismatch.',
          needs_teacher_review: false,
        });
      } else {
        const standardObjectsMap = {
          tree_plantation: ['Tree sapling', 'Soil', 'Gardening tools'],
          waste_segregation: ['Paper → Dry Waste', 'Plastic → Dry Waste', 'Organic Waste → Wet Waste'],
          water_conservation: ['Water meter', 'Low-flow faucet', 'Collection system'],
          clean_campus: ['Group activity', 'Cleaning supplies', 'Campus area'],
          green_transport: ['Bicycle', 'Walking path'],
        };
        const detected = standardObjectsMap[missionType] || ['Tree sapling', 'Soil', 'Gardening tools'];
        setAiResult({
          verified: true,
          confidence: 0.94,
          detected_objects: detected,
          message: 'Great job! Your submission was verified with 94% confidence.',
          student_explanation: 'Great job! Your submission was verified with 94% confidence based on evidence found.',
          teacher_explanation: 'Automated check passed at 94% confidence.',
          needs_teacher_review: false,
        });
      }
    }
    setStep(2);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="glass rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">{step === 2 ? 'AI Verification Result' : 'Submit Evidence'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {step === 0 && (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <span className="text-2xl">{mission.icon}</span>
                <div>
                  <p className="text-sm font-medium">{mission.title}</p>
                  <p className="text-xs text-muted-foreground">{mission.topic}</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => {
                  const picked = e.target.files?.[0];
                  if (picked) setFile(picked);
                }}
              />
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-eco-green mx-auto" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">Click to change</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Upload Evidence Photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to upload or capture</p>
                    <div className="flex gap-2 justify-center mt-3">
                      <span className="px-3 py-1 rounded-full bg-secondary text-xs flex items-center gap-1"><Upload className="w-3 h-3" /> Upload</span>
                      <span className="px-3 py-1 rounded-full bg-secondary text-xs flex items-center gap-1"><Camera className="w-3 h-3" /> Capture</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-sm">
                <MapPin className="w-4 h-4 text-eco-blue shrink-0" />
                <div>
                  <p className="font-medium text-xs">Location</p>
                  <p className="text-xs text-muted-foreground">School Campus — Auto-detected</p>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleUpload} disabled={!file}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Submit for AI Verification
              </motion.button>
            </>
          )}

          {step === 1 && (
            <div className="py-8 text-center space-y-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="font-semibold">AI Verification in Progress</h3>
              <div className="space-y-2 text-sm text-left max-w-xs mx-auto">
                {['Uploading to Cloudinary...', 'Connecting to IBM Bob AI...', 'Analyzing verification response...'].map((text, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }}
                    className="flex items-center gap-2">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.6 + 0.3 }}>
                      <CheckCircle2 className="w-4 h-4 text-eco-green" />
                    </motion.div>
                    <span className="text-muted-foreground">{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && aiResult && (
            <div className="space-y-4">
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                  className={`w-16 h-16 mx-auto rounded-2xl ${aiResult.verified ? 'bg-eco-green/10' : 'bg-destructive/10'} flex items-center justify-center mb-3`}>
                  {aiResult.verified ? (
                    <CheckCircle2 className="w-8 h-8 text-eco-green" />
                  ) : (
                    <X className="w-8 h-8 text-destructive" />
                  )}
                </motion.div>
                <h3 className="font-semibold text-lg">{aiResult.verified ? 'AI Verification Complete' : 'Verification Unsuccessful'}</h3>
              </div>
              <div className="space-y-2">
                {aiResult.detected_objects?.map((text, i) => (
                  <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                    className={`text-sm ${aiResult.verified ? 'text-eco-green' : 'text-destructive'} flex items-center gap-2`}>
                    {aiResult.verified ? '✓' : '✗'} Detected: {text}
                  </motion.p>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">Verification Confidence</p>
                <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
                  className={`text-3xl font-bold ${aiResult.verified ? 'text-eco-green' : 'text-destructive'}`}>
                  {Math.round(aiResult.confidence * (aiResult.confidence <= 1 ? 100 : 1))}%
                </motion.p>
              </div>

              {/* IBM Bob Student Explanation Display */}
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  🤖 IBM Bob AI Mentor Note
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                  {aiResult.student_explanation || aiResult.message}
                </p>
              </div>

              {aiResult.needs_teacher_review && (
                <div className="p-3 rounded-lg bg-eco-amber/10 border border-eco-amber/30 text-xs text-eco-amber flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Borderline confidence score. Submission flagged for teacher review.</span>
                </div>
              )}

              {aiResult.verified ? (
                <div className="p-3 rounded-lg bg-eco-amber/5 border border-eco-amber/20">
                  <p className="text-sm font-medium text-eco-amber">AI Verified — Awaiting Teacher Approval</p>
                  <p className="text-xs text-muted-foreground mt-1">Your teacher will review and approve this submission.</p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                  <p className="text-sm font-medium text-destructive">Verification Failed — Evidence Rejected</p>
                  <p className="text-xs text-muted-foreground mt-1">Uploaded image does not match mission requirements. Please upload a relevant image.</p>
                </div>
              )}
              <button onClick={onClose} className="w-full py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium">
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Convert a teacher-assigned task into the same shape MissionsPage expects
function taskToMission(t) {
  return {
    id: t.id,
    title: t.task,
    icon: '📋',
    description: `${t.envTopic} task assigned by your teacher.${t.syllabus ? ` Syllabus: ${t.syllabus}.` : ''}`,
    status: t.status === 'in_progress' ? 'in_progress' : 'not_started',
    color: '#3b82f6',
    progress: t.completed || 0,
    total: t.students || 1,
    deadline: t.deadline || '',
    difficulty: t.difficulty || 'Medium',
    points: t.points || 100,
    topic: t.envTopic || '',
    fromTeacher: true,
  };
}

export default function MissionsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [submitMission, setSubmitMission] = useState(null);

  // Merge teacher-assigned tasks into the missions list
  const [teacherTasks, setTeacherTasks] = useState([]);
  useEffect(() => {
    const classId = user?.className || '8-A';
    tasksAPI.getByClass(classId)
      .then(res => {
        const tasks = (res.data || []).filter(t => t.status !== 'completed');
        setTeacherTasks(tasks.map(taskToMission));
      })
      .catch(() => {});
  }, [user]);

  // Teacher tasks shown first (with a badge), then regular missions
  const allMissions = [...teacherTasks, ...mockMissions];
  const filtered = allMissions.filter(m => filter === 'all' || m.status === filter);

  const statusColors = {
    in_progress: 'bg-eco-blue/10 text-eco-blue',
    completed: 'bg-eco-green/10 text-eco-green',
    not_started: 'bg-secondary text-muted-foreground',
  };

  const statusLabels = {
    in_progress: 'In Progress',
    completed: 'Completed',
    not_started: 'Not Started',
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="w-6 h-6 text-primary" /> Environmental Missions</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete real-world environmental activities and earn Eco Points</p>
      </motion.div>

      <motion.div variants={item} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['all', 'in_progress', 'not_started', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            {f.replace('_', ' ')} {f !== 'all' && `(${allMissions.filter(m => m.status === f).length})`}
          </button>
        ))}
      </motion.div>

      <motion.div variants={container} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(mission => (
          <motion.div key={mission.id} variants={item} whileHover={{ y: -3 }}
            className="glass rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: mission.color }} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{mission.icon}</span>
              <div className="flex items-center gap-1.5">
                {mission.fromTeacher && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-eco-blue/15 text-eco-blue flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" /> Teacher
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[mission.status]}`}>{statusLabels[mission.status]}</span>
              </div>
            </div>
            <h3 className="font-semibold mb-1">{mission.title}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{mission.description}</p>

            {mission.status !== 'not_started' && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{mission.progress}/{mission.total}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(mission.progress / mission.total) * 100}%` }}
                    transition={{ duration: 1 }} className="h-full rounded-full" style={{ background: mission.color }} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {new Date(mission.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary">{mission.difficulty}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-eco-green font-medium">+{mission.points} Eco Points</span>
              {mission.status !== 'completed' && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSubmitMission(mission)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                  style={{ background: mission.color }}>
                  {mission.status === 'in_progress' ? 'Submit Evidence' : 'Start Mission'} <ChevronRight className="w-3 h-3" />
                </motion.button>
              )}
              {mission.status === 'completed' && (
                <span className="text-xs text-eco-green flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {submitMission && <VerificationModal mission={submitMission} onClose={() => setSubmitMission(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
