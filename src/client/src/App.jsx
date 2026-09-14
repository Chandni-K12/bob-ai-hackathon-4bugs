import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import OrganizerLayout from './layouts/OrganizerLayout';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import LearnPage from './pages/student/LearnPage';
import QuizPage from './pages/student/QuizPage';
import CrosswordPage from './pages/student/CrosswordPage';
import MissionsPage from './pages/student/MissionsPage';
import AIMentorPage from './pages/student/AIMentorPage';
import LeaderboardPage from './pages/student/LeaderboardPage';
import BadgesPage from './pages/student/BadgesPage';
import ProfilePage from './pages/student/ProfilePage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TaskAllocation from './pages/teacher/TaskAllocation';
import PerformancePage from './pages/teacher/PerformancePage';
import VerificationPage from './pages/teacher/VerificationPage';
import InsightsPage from './pages/teacher/InsightsPage';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/Dashboard';
import CompetitionsPage from './pages/organizer/CompetitionsPage';
import AnalyticsPage from './pages/organizer/AnalyticsPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const routes = { student: '/student', teacher: '/teacher', organizer: '/organizer' };
    return <Navigate to={routes[user.role] || '/login'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage />} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="quizzes" element={<QuizPage />} />
        <Route path="crossword" element={<CrosswordPage />} />
        <Route path="missions" element={<MissionsPage />} />
        <Route path="ai-mentor" element={<AIMentorPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="badges" element={<BadgesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherLayout /></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="tasks" element={<TaskAllocation />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="insights" element={<InsightsPage />} />
      </Route>

      {/* Organizer Routes */}
      <Route path="/organizer" element={<ProtectedRoute allowedRoles={['organizer']}><OrganizerLayout /></ProtectedRoute>}>
        <Route index element={<OrganizerDashboard />} />
        <Route path="competitions" element={<CompetitionsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
