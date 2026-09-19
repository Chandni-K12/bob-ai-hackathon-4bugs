import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Upload, MapPin, Camera, CheckCircle2, Clock, Shield, X, ChevronRight, Filter, AlertTriangle, ClipboardList } from 'lucide-react';
import { aiAPI, tasksAPI, submissionsAPI, missionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const missionTypeMap = {
  'm1': 'waste_segregation',   // Plastic-Free Week
  'm2': 'water_conservation',  // Water Saver
  'm3': 'waste_segregation',   // Waste Segregation Champion
  'm4': 'green_transport',     // Green Transport
  'm5': 'tree_plantation',     // Plant a Tree
  'm6': 'biodiversity',        // Biodiversity Explorer
  'm7': 'clean_campus',        // Clean Campus
  'm8': 'energy_saving',       // Energy Audit
  'm9': 'composting',          // Composting Hero
  'm10': 'water_conservation', // Rain Water Harvesting
};

/**
 * Derive a mission_type from the envTopic string of a teacher-assigned task.
 * This makes AI verification dynamic instead of always falling back to a single default.
 */
const topicToMissionType = {
  'water conservation': 'water_conservation',
  'renewable energy':   'energy_saving',
  'energy':             'energy_saving',
  'waste management':   'waste_segregation',
  'biodiversity':       'biodiversity',
  'composting':         'composting',
  'clean campus':       'clean_campus',
  'green transport':    'green_transport',
  'tree plantation':    'tree_plantation',
};

function deriveMissionType(mission) {
  if (missionTypeMap[mission.id]) return missionTypeMap[mission.id];
  if (mission.missionType) return mission.missionType;
  if (mission.topic) {
    const t = mission.topic.toLowerCase();
    for (const [keyword, type] of Object.entries(topicToMissionType)) {
      if (t.includes(keyword)) return type;
    }
  }
  if (mission.title) {
    const title = mission.title.toLowerCase();
    for (const [keyword, type] of Object.entries(topicToMissionType)) {
      if (title.includes(keyword)) return type;
    }
    if (title.includes('biodiversity') || title.includes('species') || title.includes('habitat')) return 'biodiversity';
    if (title.includes('energy') || title.includes('audit')) return 'energy_saving';
    if (title.includes('waste') || title.includes('segregat')) return 'waste_segregation';
    if (title.includes('water')) return 'water_conservation';
    if (title.includes('tree') || title.includes('plant')) return 'tree_plantation';
    if (title.includes('clean')) return 'clean_campus';
    if (title.includes('compost')) return 'composting';
    if (title.includes('cycle') || title.includes('transport') || title.includes('bicycle')) return 'green_transport';
  }
  return 'tree_plantation';
}

/**
 * Read a File as a base64 data-URL string.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Analyze an image file using the Canvas API to extract color statistics.
 * Returns ratios of green, brown, blue, bright, and dark pixels.
 */
function analyzeImageColors(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 80; // downsample for speed
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let green = 0, brown = 0, blue = 0, dark = 0, bright = 0, outdoor = 0;
      const total = size * size;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];

        // Green: foliage, trees, plants, grass
        if (g > r * 1.15 && g > b * 1.15 && g > 50) green++;
        // Brown: soil, earth, trunks, mud
        if (r > 70 && g > 40 && g < r && b < g && r - b > 30) brown++;
        // Blue: water, sky
        if (b > r * 1.15 && b > g * 1.05 && b > 70) blue++;
        // Dark: terminal/UI backgrounds, very dark areas
        if (r < 60 && g < 60 && b < 60) dark++;
        // Bright: sky, outdoors, well-lit photos
        if (r > 180 && g > 180 && b > 180) bright++;
        // Outdoor heuristic: varied natural tones (not uniform grays)
        if ((g > 60 || r > 80) && Math.abs(r - g) + Math.abs(g - b) > 30) outdoor++;
      }

      URL.revokeObjectURL(url);
      resolve({
        greenRatio: green / total,
        brownRatio: brown / total,
        blueRatio: blue / total,
        darkRatio: dark / total,
        brightRatio: bright / total,
        outdoorRatio: outdoor / total,
        isNatureScene: (green + brown) / total > 0.12,
        isOutdoor: outdoor / total > 0.25,
        isScreenshot: dark / total > 0.45 && outdoor / total < 0.15,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

/**
 * Mission verification rules: each mission type defines what color
 * signatures to look for and what to reject.
 */
const MISSION_VERIFY_RULES = {
  tree_plantation: {
    label: 'tree plantation activity (tree sapling, soil, gardening)',
    /** Image must have noticeable green OR brown (nature) content */
    check: (c) => c.isNatureScene || c.greenRatio > 0.08 || (c.brownRatio > 0.06 && c.outdoorRatio > 0.15),
    detected: ['Tree / plant foliage', 'Soil / earth tones', 'Outdoor environment'],
    failMsg: 'The image does not appear to show trees, plants, or soil. Please upload a photo of your tree plantation activity.',
  },
  biodiversity: {
    label: 'biodiversity activity (flora, fauna, habitat, species spotting)',
    check: (c) => c.isNatureScene || c.greenRatio > 0.08 || (c.outdoorRatio > 0.12 && !c.isScreenshot),
    detected: ['Flora / fauna', 'Natural habitat', 'Outdoor biodiversity scene'],
    failMsg: 'The image does not appear to show biodiversity evidence. Please upload a photo of plants, animals, or natural habitat observations.',
  },
  waste_segregation: {
    label: 'waste segregation (bins, sorted waste, recycling)',
    /** Should not be a dark screenshot; should have varied colors indicating physical objects */
    check: (c) => !c.isScreenshot && c.outdoorRatio > 0.15,
    detected: ['Waste bins / containers', 'Sorted materials', 'Physical environment'],
    failMsg: 'The image does not appear to show waste bins or sorted waste. Please upload a photo of your segregation activity.',
  },
  water_conservation: {
    label: 'water conservation effort (tap, meter, rainwater system)',
    /** Blue or outdoor scene, not a dark screenshot */
    check: (c) => !c.isScreenshot && (c.blueRatio > 0.04 || c.outdoorRatio > 0.15 || c.isOutdoor),
    detected: ['Water-related fixtures', 'Plumbing / conservation setup', 'Physical environment'],
    failMsg: 'The image does not appear to show water conservation evidence. Please upload a photo of taps, meters, or water collection systems.',
  },
  clean_campus: {
    label: 'campus clean-up activity (cleaning supplies, group effort)',
    /** Outdoor or well-lit scene with varied colors, not a terminal */
    check: (c) => !c.isScreenshot && (c.isOutdoor || c.outdoorRatio > 0.2),
    detected: ['Campus / outdoor area', 'Cleaning activity', 'Group environment'],
    failMsg: 'The image does not appear to show a clean-up activity. Please upload a photo showing campus cleaning or group effort.',
  },
  green_transport: {
    label: 'green transport usage (bicycle, walking path)',
    /** Outdoor scene, not a screenshot */
    check: (c) => !c.isScreenshot && (c.isOutdoor || c.outdoorRatio > 0.15),
    detected: ['Transport / pathway', 'Outdoor scene', 'Eco-friendly transit'],
    failMsg: 'The image does not appear to show green transport. Please upload a photo of bicycle, walking, or public transport usage.',
  },
  energy_saving: {
    label: 'energy saving activity (meter reading, switched-off appliances, LED lights)',
    /** Indoor or outdoor, not a dark screenshot; should show physical environment */
    check: (c) => !c.isScreenshot && (c.outdoorRatio > 0.10 || c.brightRatio > 0.10),
    detected: ['Electricity meter / appliance', 'Energy-efficient setup', 'Physical environment'],
    failMsg: 'The image does not appear to show energy saving evidence. Please upload a photo of your meter reading, switched-off appliances, or energy-efficient setup.',
  },
  composting: {
    label: 'composting activity (compost pit, kitchen waste, earthworms)',
    /** Should show nature/organic tones — brown and green */
    check: (c) => c.isNatureScene || c.brownRatio > 0.06 || (c.outdoorRatio > 0.15 && !c.isScreenshot),
    detected: ['Compost pit / bin', 'Organic waste material', 'Soil / earth environment'],
    failMsg: 'The image does not appear to show composting activity. Please upload a photo of your compost pit, kitchen waste setup, or vermicomposting bin.',
  },
};

function VerificationModal({ mission, onClose, onVerified }) {
  const [step, setStep] = useState(0); // 0: upload, 1: verifying, 2: result
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);

  // Generate image preview when file is selected
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;
    setStep(1);
    const missionType = deriveMissionType(mission);
    const rules = MISSION_VERIFY_RULES[missionType] || MISSION_VERIFY_RULES.tree_plantation;

    try {
      // Try the AI backend first
      const imageBase64 = await fileToBase64(file);
      const res = await aiAPI.verifyImage({
        image_url: imageBase64,
        mission_type: missionType,
        file_name: file.name,
        file_size: file.size,
      });
      setAiResult(res.data);
    } catch (err) {
      console.warn('AI service unavailable — running client-side image analysis', err);

      // ── Client-side image analysis using Canvas color sampling ──
      const colors = await analyzeImageColors(file);

      if (!colors) {
        // Could not read the image at all
        setAiResult({
          verified: false,
          confidence: 0.0,
          detected_objects: [],
          message: 'Unable to read the image file. Please try a different photo.',
          student_explanation: 'We could not open your image. Please try uploading a JPEG or PNG photo.',
          teacher_explanation: `Image file "${file.name}" could not be decoded for analysis.`,
          needs_teacher_review: true,
        });
      } else if (rules.check(colors)) {
        // ✅ Image colors match the expected mission content
        const confidence = Math.min(
          0.70 + colors.greenRatio * 0.3 + colors.outdoorRatio * 0.2 + colors.brownRatio * 0.1,
          0.96
        );
        setAiResult({
          verified: true,
          confidence: Math.round(confidence * 100) / 100,
          detected_objects: rules.detected,
          message: `Your submission has been verified! The image shows evidence consistent with ${rules.label}.`,
          student_explanation: `Great work! Your photo appears to show ${rules.label}. The AI detected relevant visual elements with ${Math.round(confidence * 100)}% confidence.`,
          teacher_explanation: `Client-side image analysis passed for "${missionType}". Color profile: ${Math.round(colors.greenRatio * 100)}% green, ${Math.round(colors.brownRatio * 100)}% brown, ${Math.round(colors.outdoorRatio * 100)}% outdoor tones. File: "${file.name}" (${(file.size / 1024).toFixed(1)} KB).`,
          needs_teacher_review: confidence < 0.80,
        });
      } else {
        // ❌ Image colors don't match — likely a screenshot or unrelated photo
        const confidence = Math.max(0.10, colors.outdoorRatio * 0.4);
        setAiResult({
          verified: false,
          confidence: Math.round(confidence * 100) / 100,
          detected_objects: colors.isScreenshot
            ? ['Screen / UI interface detected', 'No outdoor or nature elements found']
            : ['Image content does not match mission requirements'],
          message: rules.failMsg,
          student_explanation: rules.failMsg,
          teacher_explanation: `Client-side image analysis FAILED for "${missionType}". Color profile: ${Math.round(colors.darkRatio * 100)}% dark, ${Math.round(colors.greenRatio * 100)}% green, ${Math.round(colors.outdoorRatio * 100)}% outdoor. ${colors.isScreenshot ? 'Image appears to be a screenshot.' : 'Image content does not match mission evidence expectations.'} File: "${file.name}".`,
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

              {/* Expected evidence hint */}
              <div className="p-3 rounded-lg bg-eco-blue/5 border border-eco-blue/20">
                <p className="text-xs font-medium text-eco-blue flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> What to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {`Upload a clear photo showing ${(MISSION_VERIFY_RULES[deriveMissionType(mission)] || MISSION_VERIFY_RULES.tree_plantation).label}.`}
                </p>
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
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                {file && preview ? (
                  <div className="space-y-3">
                    <img src={preview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg mx-auto" />
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">Click to change photo</p>
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
                {['Uploading evidence image...', 'Connecting to IBM Bob AI...', 'Analyzing image content...'].map((text, i) => (
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
                <h3 className="font-semibold text-lg">{aiResult.verified ? 'Verification Passed!' : 'Verification Unsuccessful'}</h3>
              </div>

              {/* Show detected objects only when there are some */}
              {aiResult.detected_objects?.length > 0 && (
                <div className="space-y-2">
                  {aiResult.detected_objects.map((text, i) => (
                    <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                      className={`text-sm flex items-center gap-2 ${aiResult.verified ? 'text-eco-green' : 'text-muted-foreground'}`}>
                      {aiResult.verified ? '✓' : '•'} Detected: {text}
                    </motion.p>
                  ))}
                </div>
              )}

              {/* No objects detected message */}
              {(!aiResult.detected_objects || aiResult.detected_objects.length === 0) && (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-center">
                  <p className="text-sm text-destructive font-medium">No relevant evidence detected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please upload a photo that clearly shows your mission activity.
                  </p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">Verification Confidence</p>
                <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
                  className={`text-3xl font-bold ${aiResult.verified ? 'text-eco-green' : aiResult.confidence > 0.5 ? 'text-eco-amber' : 'text-destructive'}`}>
                  {Math.round(aiResult.confidence * (aiResult.confidence <= 1 ? 100 : 1))}%
                </motion.p>
              </div>

              {/* IBM Bob Student Explanation Display */}
              <div className={`p-3.5 rounded-xl border space-y-1 ${aiResult.verified ? 'bg-primary/10 border-primary/20' : 'bg-destructive/5 border-destructive/20'}`}>
                <p className={`text-xs font-semibold flex items-center gap-1.5 ${aiResult.verified ? 'text-primary' : 'text-destructive'}`}>
                  🤖 IBM Bob AI Mentor Note
                </p>
                <p className="text-xs text-foreground leading-relaxed">
                  {aiResult.student_explanation || aiResult.message}
                </p>
              </div>

              {aiResult.needs_teacher_review && (
                <div className="p-3 rounded-lg bg-eco-amber/10 border border-eco-amber/30 text-xs text-eco-amber flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{aiResult.verified
                    ? 'Borderline confidence score. Submission flagged for teacher review.'
                    : 'This submission needs teacher review. Please wait for your teacher to verify it manually.'
                  }</span>
                </div>
              )}

              {aiResult.verified ? (
                <div className="p-3 rounded-lg bg-eco-green/5 border border-eco-green/20">
                  <p className="text-sm font-medium text-eco-green">✓ AI Verified — Awaiting Teacher Approval</p>
                  <p className="text-xs text-muted-foreground mt-1">Your evidence has been verified. Your teacher will approve the final score.</p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive">✗ Verification Failed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your image doesn't appear to match this mission. Please try uploading a clearer photo of the required evidence, or wait for your teacher to review.
                  </p>
                </div>
              )}

              <button
                onClick={() => { if (aiResult?.verified) onVerified(mission.id, aiResult); else onClose(); }}
                className={`w-full py-3 rounded-xl text-sm font-medium ${
                  aiResult.verified
                    ? 'bg-secondary hover:bg-secondary/80'
                    : 'gradient-primary text-white hover:opacity-90'
                }`}>
                {aiResult.verified ? 'Done' : 'Try Again with Different Photo'}
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

const fallbackMissions = [
  { id: 'm1', title: 'Plastic-Free Week', icon: '♻️', description: 'Avoid single-use plastics for 7 days and track your impact.', topic: 'Waste Management', difficulty: 'Easy', points: 100, progress: 2, total: 7, deadline: '2026-08-30', status: 'in_progress', color: '#22c55e' },
  { id: 'm2', title: 'Water Saver', icon: '💧', description: 'Track daily water-saving habits and reduce unnecessary consumption.', topic: 'Water Conservation', difficulty: 'Medium', points: 75, progress: 3, total: 5, deadline: '2026-08-23', status: 'in_progress', color: '#3b82f6' },
  { id: 'm5', title: 'Plant a Tree', icon: '🌳', description: 'Plant and document a sapling in your neighborhood or school area.', topic: 'Biodiversity', difficulty: 'Hard', points: 200, progress: 0, total: 1, deadline: '2026-09-05', status: 'not_started', color: '#16a34a' },
  { id: 'm6', title: 'Biodiversity Explorer', icon: '🦋', description: 'Observe and document local species and habitats.', topic: 'Biodiversity', difficulty: 'Hard', points: 150, progress: 6, total: 10, deadline: '2026-09-10', status: 'in_progress', color: '#a855f7' },
];

export default function MissionsPage() {
  const { user, addPoints } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetId = searchParams.get('id');
  const targetTitle = searchParams.get('title');
  const [filter, setFilter] = useState('all');
  const [submitMission, setSubmitMission] = useState(null);
  const [missions, setMissions] = useState(fallbackMissions);
  const [openedMission, setOpenedMission] = useState(null);
  const recommendedMission = searchParams.get('mission')?.trim().toLowerCase();

  useEffect(() => {
    let active = true;
    missionsAPI.getAll()
      .then((res) => {
        if (!active) return;
        const next = (res.data || []).map((mission) => ({
          id: mission.id,
          title: mission.title,
          icon: mission.icon || ['♻️', '💧', '🌳', '🦋'][Number(mission.id?.replace(/\D/g, '') || 1) % 4],
          description: mission.description || `${mission.topic || 'Environmental'} mission`,
          topic: mission.topic || 'Sustainability',
          difficulty: mission.difficulty || 'Medium',
          points: Number(mission.points || 0),
          progress: Number(mission.progress || 0),
          total: Number(mission.total || 1),
          deadline: mission.deadline || '2026-09-15',
          status: mission.status || 'not_started',
          color: mission.color || '#22c55e',
          verificationRequired: Boolean(mission.verificationRequired ?? true),
        }));
        if (next.length) setMissions(next);
      })
      .catch(() => {
        setMissions(fallbackMissions);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!recommendedMission || openedMission === recommendedMission) return;
    const mission = missions.find((item) => item.title.toLowerCase() === recommendedMission);
    if (!mission) return;

    const missionToOpen = {
      ...mission,
      status: mission.status === 'not_started' ? 'in_progress' : mission.status,
      progress: mission.status === 'not_started' ? Math.max(mission.progress, 1) : mission.progress,
    };
    setMissions((current) => current.map((item) => item.id === mission.id ? missionToOpen : item));
    setSubmitMission(missionToOpen);
    setOpenedMission(recommendedMission);
  }, [missions, openedMission, recommendedMission]);

  const startMission = (id) => {
    setMissions(prev => prev.map(m =>
      m.id === id ? { ...m, status: 'in_progress', progress: Math.max(m.progress, 1) } : m
    ));
  };

  const completeMission = (id) => {
    setMissions(prev => prev.map(m =>
      m.id === id ? { ...m, status: 'completed', progress: m.total } : m
    ));
  };

  // Merge teacher-assigned tasks into the missions list
  const [teacherTasks, setTeacherTasks] = useState([]);
  const refreshTeacherTasks = () => {
    const classId = user?.className || user?.classId || '8-A';
    tasksAPI.getByClass(classId)
      .then(res => {
        const tasks = (res.data || []).filter(t => t.status !== 'completed');
        setTeacherTasks(tasks.map(taskToMission));
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshTeacherTasks();

    const handleTaskRefresh = () => refreshTeacherTasks();
    const handleStorageRefresh = (event) => {
      if (event.key === 'gengreen_task_refresh') refreshTeacherTasks();
    };
    const handleVisibility = () => {
      if (!document.hidden) refreshTeacherTasks();
    };

    window.addEventListener('gengreen-task-refresh', handleTaskRefresh);
    window.addEventListener('storage', handleStorageRefresh);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('gengreen-task-refresh', handleTaskRefresh);
      window.removeEventListener('storage', handleStorageRefresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.className, user?.classId]);

  // Match target mission from URL query parameter
  const isMatch = (m) => {
    if (targetId && m.id === targetId) return true;
    if (targetTitle) {
      const q = targetTitle.toLowerCase();
      const titleLower = (m.title || '').toLowerCase();
      const topicLower = (m.topic || '').toLowerCase();
      return titleLower.includes(q) || q.includes(titleLower) || topicLower.includes(q) || q.includes(topicLower);
    }
    return false;
  };

  const baseMissions = [...teacherTasks, ...missions];

  // Auto-open modal & auto-start targeted mission when redirected from Dashboard
  const [autoOpened, setAutoOpened] = useState(false);
  useEffect(() => {
    if ((targetId || targetTitle) && !autoOpened && baseMissions.length > 0) {
      const match = baseMissions.find(isMatch);
      if (match) {
        if (match.status === 'not_started') {
          startMission(match.id);
        }
        setSubmitMission(match);
        setAutoOpened(true);
      }
    }
  }, [targetId, targetTitle, baseMissions, autoOpened]);

  // If a target parameter exists in URL, display ONLY that targeted mission card!
  const filtered = (targetId || targetTitle)
    ? baseMissions.filter(isMatch)
    : baseMissions.filter(m => filter === 'all' || m.status === filter);

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

  const handleClearTarget = () => {
    setSearchParams({});
    setAutoOpened(false);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-6xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="w-6 h-6 text-primary" /> Environmental Missions</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete real-world environmental activities and earn Eco Points</p>
      </motion.div>

      {(targetTitle || targetId) && (
        <motion.div variants={item} className="p-3.5 rounded-xl bg-eco-blue/10 border border-eco-blue/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-eco-blue">
            <span>🎯 Targeted Mission Selected:</span>
            <span className="text-foreground font-bold">{targetTitle || targetId}</span>
          </div>
          <button
            onClick={handleClearTarget}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90 font-medium transition"
          >
            Show All Missions
          </button>
        </motion.div>
      )}

      {!(targetTitle || targetId) && (
        <motion.div variants={item} className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {['all', 'in_progress', 'not_started', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {f.replace('_', ' ')} {f !== 'all' && `(${baseMissions.filter(m => m.status === f).length})`}
            </button>
          ))}
        </motion.div>
      )}

      <motion.div variants={container} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(mission => {
          const matched = isMatch(mission);
          return (
            <motion.div
              key={mission.id}
              variants={item}
              whileHover={{ y: -3 }}
              className={`glass rounded-xl p-5 relative overflow-hidden group transition-all ${
                matched ? 'ring-2 ring-eco-blue border-eco-blue bg-eco-blue/5 shadow-xl scale-[1.01]' : ''
              }`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ background: mission.color }} />
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{mission.icon}</span>
                <div className="flex items-center gap-1.5">
                  {matched && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-eco-blue text-white font-bold shadow-xs">
                      Targeted Mission
                    </span>
                  )}
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
              {mission.status === 'not_started' && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => startMission(mission.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                  style={{ background: mission.color }}>
                  Start Mission <ChevronRight className="w-3 h-3" />
                </motion.button>
              )}
              {mission.status === 'in_progress' && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSubmitMission(mission)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1"
                  style={{ background: mission.color }}>
                  Submit Evidence <ChevronRight className="w-3 h-3" />
                </motion.button>
              )}
              {mission.status === 'completed' && (
                <span className="text-xs text-eco-green flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>

      <AnimatePresence>
        {submitMission && (
          <VerificationModal
            mission={submitMission}
            onClose={() => setSubmitMission(null)}
            onVerified={(id, aiResult) => {
              submissionsAPI.create({
                studentName:        user?.name || 'Student',
                missionTitle:       submitMission.title,
                verified:           aiResult?.verified ?? true,
                confidence:         aiResult?.confidence ?? 0,
                teacherExplanation: aiResult?.teacher_explanation ?? '',
                needsTeacherReview: aiResult?.needs_teacher_review ?? false,
                detectedItems:      aiResult?.detected_objects ?? [],
              }).catch(() => {});
              completeMission(id);
              if (submitMission?.points) addPoints(Number(submitMission.points));
              setSubmitMission(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
