import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Leaf, GraduationCap, BookOpen, Building, ArrowRight, Eye, EyeOff, UserPlus, ArrowLeft, Search, MapPin, School, X } from 'lucide-react';

const roles = [
  { id: 'student', label: 'Student', icon: GraduationCap, color: 'from-green-500 to-emerald-600', glow: 'rgba(34,197,94,0.3)', desc: 'Learn, play & earn eco points' },
  { id: 'teacher', label: 'Teacher', icon: BookOpen, color: 'from-blue-500 to-indigo-600', glow: 'rgba(59,130,246,0.3)', desc: 'Manage classes & grade students' },
  { id: 'organizer', label: 'Organizer', icon: Building, color: 'from-purple-500 to-pink-600', glow: 'rgba(168,85,247,0.3)', desc: 'Manage schools & competitions' },
];

const SCHOOLS_LIST = [
  'Green Valley School', 'Sunrise Academy', 'ABC Public School',
  'Delhi Public School', 'Kendriya Vidyalaya', 'DAV Public School',
  'Ryan International School', 'Podar International School',
  'Vibgyor High School', 'Amity International School',
  'St. Xavier\'s School', 'La Martiniere School',
  'Bishop Cotton School', 'The Heritage School',
  'Modern School', 'Springdales School',
  'Sanskriti School', 'Mother\'s International School',
  'Lotus Valley International School', 'Pathways School',
];

const COLLEGES_LIST = [
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur',
  'NIT Trichy', 'NIT Warangal', 'NIT Surathkal',
  'BITS Pilani', 'BITS Hyderabad', 'BITS Goa',
  'Christ University', 'St. Xavier\'s College',
  'Loyola College', 'Fergusson College',
  'Presidency University', 'Jadavpur University',
  'Anna University', 'VIT Vellore',
  'SRM University', 'Manipal University',
  'Symbiosis University', 'Amity University',
];

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow',
  'Surat', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad',
  'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Varanasi', 'Chandigarh', 'Coimbatore', 'Kochi',
  'Mangalore', 'Dehradun', 'Shimla', 'Mysore', 'Guwahati',
];

const CLASSES = ['6-A', '6-B', '7-A', '7-B', '8-A', '8-B', '9-A', '9-B', '10-A', '10-B', '11-Sci', '11-Com', '12-Sci', '12-Com'];

function SearchableSelect({ label, placeholder, options, value, onChange, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  }, [options, query]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0) {
        handleSelect(filtered[0]);
      } else if (query.trim()) {
        handleSelect(query.trim());
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const exactMatch = options.some(o => o.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1 text-muted-foreground">{label}</label>
      <div
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus-within:border-primary cursor-pointer text-sm flex items-center gap-2 transition"
      >
        {Icon && <Icon className="w-4 h-4 text-muted-foreground shrink-0" />}
        <span className={`truncate flex-1 ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
          {value || placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="text-muted-foreground hover:text-foreground p-0.5 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-secondary">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent outline-none text-sm"
                  placeholder={`Search or type ${label.toLowerCase()}...`}
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-40 divide-y divide-border/30">
              {query.trim() && !exactMatch && (
                <button
                  type="button"
                  onClick={() => handleSelect(query.trim())}
                  className="w-full text-left px-4 py-2 text-sm text-primary font-medium hover:bg-secondary transition flex items-center justify-between"
                >
                  <span className="truncate">Use &quot;{query.trim()}&quot;</span>
                  <span className="text-[10px] uppercase font-semibold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">Custom</span>
                </button>
              )}
              {filtered.length === 0 && !query.trim() ? (
                <p className="text-xs text-muted-foreground p-3 text-center">No options available</p>
              ) : (
                filtered.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition flex items-center justify-between ${
                      opt === value ? 'text-primary font-medium bg-primary/10' : ''
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {opt === value && <span className="text-xs text-primary">✓</span>}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [institutionType, setInstitutionType] = useState('school');
  const [institutionName, setInstitutionName] = useState('');
  const [classId, setClassId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const institutionOptions = institutionType === 'school' ? SCHOOLS_LIST : COLLEGES_LIST;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userData = {
        name,
        email,
        password,
        role: selectedRole.id,
        city: city || null,
        institutionType,
        schoolId: institutionName || null,
        classId: selectedRole.id === 'student' ? (classId || null) : null,
      };
      const user = await register(userData);
      const routes = { student: '/student', teacher: '/teacher', organizer: '/organizer' };
      navigate(routes[user.role] || '/student');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Playful Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
        <div className="absolute top-[8%] left-[8%] text-6xl opacity-15 animate-float-slow">☁️</div>
        <div className="absolute top-[35%] right-[12%] text-5xl opacity-12 animate-float-medium">☁️</div>
        <div className="absolute top-[18%] left-[4%] text-3xl opacity-20 animate-drift-leaves">🍃</div>
        <div className="absolute bottom-[25%] left-[6%] text-4xl opacity-20 animate-drift-leaves">🍃</div>
        <div className="absolute top-[45%] left-[9%] text-4xl opacity-25 animate-fly-butterfly">🦋</div>
        <div className="absolute top-[28%] right-[8%] text-3xl opacity-20 animate-fly-butterfly-reverse">🦋</div>
        <div className="absolute top-[4%] right-[4%] text-6xl opacity-15 animate-float-slow">☀️</div>
        <div className="absolute top-[12%] left-[25%] text-3xl opacity-15 animate-float-slow">🌸</div>
        <div className="absolute bottom-[15%] left-[18%] text-3xl opacity-20 animate-drift-leaves">🌼</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 glow-green"
          >
            <Leaf className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Join GenGreen</h1>
          <p className="text-muted-foreground text-sm">Create your account to start your eco journey</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6">
          {!selectedRole ? (
            <>
              <h2 className="text-lg font-semibold text-center mb-6">I am a...</h2>
              <div className="space-y-3">
                {roles.map((role, i) => (
                  <motion.button
                    key={role.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    onClick={() => { setSelectedRole(role); setError(''); }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 bg-secondary/30 hover:bg-secondary/60 transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shrink-0 group-hover:shadow-lg transition-shadow`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </p>
            </>
          ) : (
            <AnimatePresence mode="wait">
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-3"
              >
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1 mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to roles
                </button>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedRole.color} flex items-center justify-center`}>
                    <selectedRole.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{selectedRole.label} Registration</p>
                    <p className="text-xs text-muted-foreground">{selectedRole.desc}</p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                {/* City — for all roles */}
                <SearchableSelect
                  label="City"
                  placeholder="Select your city"
                  options={CITIES}
                  value={city}
                  onChange={setCity}
                  icon={MapPin}
                />

                {/* Institution Type Toggle — for all roles */}
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Institution Type</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setInstitutionType('school'); setInstitutionName(''); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                        institutionType === 'school'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      <School className="w-4 h-4" /> School
                    </button>
                    <button
                      type="button"
                      onClick={() => { setInstitutionType('college'); setInstitutionName(''); }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
                        institutionType === 'college'
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" /> College
                    </button>
                  </div>
                </div>

                {/* Searchable Institution Name */}
                <SearchableSelect
                  label={institutionType === 'school' ? 'School Name' : 'College Name'}
                  placeholder={`Search for your ${institutionType}...`}
                  options={institutionOptions}
                  value={institutionName}
                  onChange={setInstitutionName}
                  icon={Building}
                />

                {/* Class selection — only for students */}
                {selectedRole.id === 'student' && (
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Class</label>
                    <select
                      value={classId}
                      onChange={e => setClassId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-primary outline-none text-sm transition"
                    >
                      <option value="">Select your class</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition pr-10"
                      placeholder="Create password"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition"
                    placeholder="Confirm password"
                    required
                  />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
                    {error}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${selectedRole.color} hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-center text-muted-foreground mt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                </p>
              </motion.form>
            </AnimatePresence>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Gamified Environmental Education Platform
        </p>
      </motion.div>
    </div>
  );
}
