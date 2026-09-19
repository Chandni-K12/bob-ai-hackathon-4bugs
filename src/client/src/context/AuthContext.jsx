import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI } from '../services/api';

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
    const token = localStorage.getItem('eco_token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    authAPI.getProfile()
      .then((res) => {
        const nextUser = normalizeUser(res.data);
        setUser(nextUser);
      })
      .catch(() => {
        localStorage.removeItem('eco_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, role) => {
    const response = await authAPI.login({ email, password, role });
    const userData = normalizeUser(response.data.user ?? response.data);
    localStorage.setItem('eco_token', response.data.token || 'mock_jwt_' + Date.now());
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('eco_token');
    localStorage.removeItem('eco_user');
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updater) => {
    const current = user;
    const next = typeof updater === 'function' ? updater(current) : updater;
    if (!next) return null;

    const normalized = normalizeUser(next);
    setUser(normalized);

    if (!normalized.id) return normalized;

    try {
      const response = await usersAPI.update(normalized.id, {
        points: normalized.points,
        streak: normalized.streak,
        level: normalized.level,
        badges: normalized.badges,
      });

      const synced = normalizeUser(response.data?.user ?? response.data ?? normalized);
      setUser(synced);
      return synced;
    } catch (error) {
      console.warn('User profile sync to database failed:', error.message);
      return normalized;
    }
  }, [user]);

  const addPoints = useCallback((pointsToAdd) => {
    if (!Number.isFinite(Number(pointsToAdd)) || Number(pointsToAdd) === 0) return;
    return updateUser((current) => {
      const nextUser = current || { id: 'student', name: 'Student', role: 'student', points: 0, streak: 0, level: 1 };
      return { ...nextUser, points: Number(nextUser.points ?? 0) + Number(pointsToAdd) };
    });
  }, [updateUser]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, addPoints, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
