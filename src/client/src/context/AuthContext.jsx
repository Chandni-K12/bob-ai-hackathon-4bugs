import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const normalizeUser = (payload) => {
  const user = payload?.user ?? payload ?? {};
  return {
    ...user,
    id: user.id,
    name: user.name || 'Student',
    email: user.email || '',
    role: user.role || 'student',
    classId: user.classId || user.class_id || user.className || 'c1',
    className: user.className || user.class_name || user.class || '8-A',
    schoolId: user.schoolId || user.school_id || 's1',
    schoolName: user.schoolName || user.school_name || user.school || 'Green Valley School',
    points: Number(user.points ?? 0),
    streak: Number(user.streak ?? 0),
    level: Number(user.level ?? 1),
    badges: Number(user.badges ?? 0),
    avatar: user.avatar || (user.role === 'teacher' ? '👩‍🏫' : user.role === 'organizer' ? '👩‍💼' : '🌿'),
  };
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('eco_user');
    if (stored) {
      try {
        const parsed = normalizeUser(JSON.parse(stored));
        setUser(parsed);
      } catch {
        localStorage.removeItem('eco_user');
      }
    }

    const token = localStorage.getItem('eco_token');
    if (!stored && token) {
      authAPI.getProfile()
        .then((res) => {
          const nextUser = normalizeUser(res.data);
          localStorage.setItem('eco_user', JSON.stringify(nextUser));
          setUser(nextUser);
        })
        .catch(() => {
          localStorage.removeItem('eco_token');
          setUser(null);
        });
    }

    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, role) => {
    const response = await authAPI.login({ email, password, role });
    const userData = normalizeUser(response.data.user ?? response.data);
    localStorage.setItem('eco_token', response.data.token || 'mock_jwt_' + Date.now());
    localStorage.setItem('eco_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('eco_token');
    localStorage.removeItem('eco_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
