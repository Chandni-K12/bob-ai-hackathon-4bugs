import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, HelpCircle, Puzzle, Target,
  Bot, Trophy, Award, User, Bell, LogOut, Menu, X, Leaf
} from 'lucide-react';
import { mockNotifications } from '../data/mockData';

const navItems = [
  { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/student/learn', icon: BookOpen, label: 'Learn' },
  { to: '/student/quizzes', icon: HelpCircle, label: 'Quizzes' },
  { to: '/student/crossword', icon: Puzzle, label: 'Eco Crossword' },
  { to: '/student/missions', icon: Target, label: 'Missions' },
  { to: '/student/ai-mentor', icon: Bot, label: 'AI Eco Mentor' },
  { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/student/badges', icon: Award, label: 'Badges' },
  { to: '/student/profile', icon: User, label: 'Profile' },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Playful Animated Background Cartoons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
        {/* Clouds */}
        <div className="absolute top-[8%] left-[8%] text-6xl opacity-15 animate-float-slow">☁️</div>
        <div className="absolute top-[35%] right-[12%] text-5xl opacity-12 animate-float-medium">☁️</div>
        <div className="absolute top-[65%] left-[15%] text-5xl opacity-10 animate-float-slow">☁️</div>
        <div className="absolute bottom-[10%] right-[25%] text-6xl opacity-12 animate-float-medium">☁️</div>
        <div className="absolute top-[20%] right-[40%] text-4xl opacity-10 animate-float-slow">☁️</div>
        
        {/* Leaves */}
        <div className="absolute top-[18%] left-[4%] text-3xl opacity-20 animate-drift-leaves">🍃</div>
        <div className="absolute bottom-[25%] left-[6%] text-4xl opacity-20 animate-drift-leaves">🍃</div>
        <div className="absolute bottom-[40%] right-[6%] text-4xl opacity-18 animate-drift-leaves-reverse">🍂</div>
        <div className="absolute top-[50%] right-[18%] text-3xl opacity-15 animate-drift-leaves-reverse">🍂</div>
        <div className="absolute top-[75%] left-[28%] text-3xl opacity-15 animate-drift-leaves">🍁</div>
        <div className="absolute top-[5%] right-[22%] text-4xl opacity-12 animate-drift-leaves-reverse">🍁</div>
        
        {/* Butterflies */}
        <div className="absolute top-[45%] left-[9%] text-4xl opacity-25 animate-fly-butterfly">🦋</div>
        <div className="absolute top-[28%] right-[8%] text-3xl opacity-20 animate-fly-butterfly-reverse">🦋</div>
        <div className="absolute bottom-[18%] right-[14%] text-4xl opacity-22 animate-fly-butterfly">🦋</div>
        <div className="absolute bottom-[60%] left-[22%] text-[28px] opacity-18 animate-fly-butterfly-reverse">🦋</div>

        {/* Playful Suns & Balloons */}
        <div className="absolute top-[4%] right-[4%] text-6xl opacity-15 animate-float-slow">☀️</div>
        <div className="absolute bottom-[30%] left-[40%] text-4xl opacity-12 animate-float-medium">🎈</div>
        <div className="absolute top-[55%] right-[3%] text-4xl opacity-15 animate-float-slow">🎈</div>

        {/* Flowers & Plants */}
        <div className="absolute top-[12%] left-[25%] text-3xl opacity-15 animate-float-slow">🌸</div>
        <div className="absolute bottom-[15%] left-[18%] text-3xl opacity-20 animate-drift-leaves">🌼</div>
        <div className="absolute top-[80%] right-[35%] text-4xl opacity-15 animate-drift-leaves-reverse">🌻</div>
        <div className="absolute top-[40%] left-[45%] text-[32px] opacity-12 animate-float-medium">🌸</div>
        
        {/* Stars / Sparkles */}
        <div className="absolute top-[25%] left-[18%] text-2xl opacity-15 animate-float-slow">✨</div>
        <div className="absolute top-[70%] right-[8%] text-3xl opacity-18 animate-float-medium">⭐</div>
        <div className="absolute bottom-[8%] left-[50%] text-2xl opacity-15 animate-float-slow">✨</div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-xl fixed h-full z-30">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg border border-emerald-400">
              <span className="text-xl icon-3d icon-bounce">🌱</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-gradient">GenGreen</h1>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary glow-green'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-lg">
              {user?.avatar || '🌿'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.className} • {user?.schoolName?.split(' ')[0]}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition w-full px-2 py-1.5 rounded-lg hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-xl border-b border-border z-40 flex items-center px-4 justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-secondary rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl icon-3d icon-bounce">🌱</span>
          <span className="font-bold text-gradient">GenGreen</span>
        </div>
        <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:bg-secondary rounded-lg relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 lg:hidden flex flex-col"
            >
              <div className="p-4 border-b border-border flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl icon-3d icon-bounce">🌱</span>
                  <span className="font-bold text-gradient">GenGreen</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {navItems.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`
                    }
                  >
                    <item.icon className="w-4.5 h-4.5" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="p-4 border-t border-border">
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition w-full px-2 py-1.5">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Notification Panel */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setNotifOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-14 right-2 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
            >
              <div className="p-3 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>
              {mockNotifications.map(n => (
                <div key={n.id} className={`p-3 border-b border-border/50 flex gap-3 ${!n.read ? 'bg-primary/5' : ''}`}>
                  <span className="text-xl">{n.icon}</span>
                  <div>
                    <p className="text-sm">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 mt-14 lg:mt-0">
        <div className="hidden lg:flex items-center justify-between px-6 h-14 border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-20">
          <div />
          <div className="flex items-center gap-3">
            <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 hover:bg-secondary rounded-lg relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg">
              <span className="text-lg">{user?.avatar || '🌿'}</span>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </div>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
