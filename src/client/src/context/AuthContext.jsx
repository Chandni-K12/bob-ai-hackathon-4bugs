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
    city: user.city || null,
    institutionType: user.institutionType || user.institution_type || 'school',
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
    const storedUser = localStorage.getItem('eco_user');

    if (!token && !storedUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (storedUser) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem('eco_user');
      }
    }

    if (token) {
      authAPI.getProfile()
        .then((res) => {
          const nextUser = normalizeUser(res.data);
          localStorage.setItem('eco_user', JSON.stringify(nextUser));
          setUser(nextUser);
        })
        .catch(() => {
          // Keep offline user if token verification fails
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password, role) => {
    try {
      const res = await authAPI.login({ email, password, role });
      const rawUser = res.data.user ?? res.data;
      const userData = normalizeUser(rawUser);
      const token = res.data.token || 'mock_jwt_' + Date.now();
      localStorage.setItem('eco_token', token);
      localStorage.setItem('eco_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        const message = err.response?.data?.error || 'Invalid credentials';
        throw new Error(message);
      }
      // Network or server error fallback
      const stored = localStorage.getItem('eco_user');
      if (stored) {
        try {
          const u = normalizeUser(JSON.parse(stored));
          if (u.email === email && (!role || u.role === role)) {
            setUser(u);
            return u;
          }
        } catch {}
      }
      const demoUsers = {
        'ananya@student.eco': { id: 'u1', name: 'Ananya Sharma', email: 'ananya@student.eco', role: 'student', points: 2450, streak: 5, level: 12, badges: 12 },
        'meera@teacher.eco': { id: 't1', name: 'Dr. Meera Reddy', email: 'meera@teacher.eco', role: 'teacher' },
        'lakshmi@organizer.eco': { id: 'o1', name: 'Mrs. Lakshmi Menon', email: 'lakshmi@organizer.eco', role: 'organizer' },
      };
      if (demoUsers[email]) {
        const u = normalizeUser(demoUsers[email]);
        localStorage.setItem('eco_token', 'token_demo_' + Date.now());
        localStorage.setItem('eco_user', JSON.stringify(u));
        setUser(u);
        return u;
      }
      const message = err.response?.data?.error || 'Unable to connect to server. Please try again.';
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const res = await authAPI.register(userData);
      const rawUser = res.data.user ?? res.data;
      const newUser = normalizeUser(rawUser);
      const token = res.data.token || 'token_' + Date.now();
      localStorage.setItem('eco_token', token);
      localStorage.setItem('eco_user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (err) {
      if (err.response?.status === 409 || err.response?.status === 400) {
        const message = err.response?.data?.error || 'Registration failed';
        throw new Error(message);
      }
      console.warn('Backend API connection issue, creating local session:', err.message);
      const newUser = normalizeUser({
        id: userData.role.charAt(0) + '_' + Date.now(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        city: userData.city || null,
        institutionType: userData.institutionType || 'school',
        schoolId: userData.schoolId || null,
        classId: userData.classId || null,
        points: 0,
        streak: 0,
        level: 1,
        badges: 0,
      });
      const token = 'token_local_' + Date.now();
      localStorage.setItem('eco_token', token);
      localStorage.setItem('eco_user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    }
  }, []);

  const updateUser = useCallback(async (updater) => {
    const current = user;
    const next = typeof updater === 'function' ? updater(current) : updater;
    if (!next) return null;

    const normalized = normalizeUser(next);
    localStorage.setItem('eco_user', JSON.stringify(normalized));
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
      localStorage.setItem('eco_user', JSON.stringify(synced));
      setUser(synced);
      return synced;
    } catch (error) {
      console.warn('User profile sync to database failed:', error.message);
      return normalized;
    }
  }, [user]);

  const addPoints = useCallback((pointsToAdd, activity) => {
    const amount = Number(pointsToAdd) || 0;
    if (amount <= 0) return;
    return updateUser((current) => {
      const nextUser = current || { id: 'student', name: 'Student', role: 'student', points: 0, streak: 0, level: 1 };
      const nextPoints = Number(nextUser.points ?? 0) + amount;
      return {
        ...nextUser,
        points: nextPoints,
        level: Math.floor(nextPoints / 200) + 1,
      };
    });
  }, [updateUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('eco_token');
    localStorage.removeItem('eco_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, addPoints, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
