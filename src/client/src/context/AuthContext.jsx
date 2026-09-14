import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('eco_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { localStorage.removeItem('eco_user'); }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, role) => {
    // Mock login — find user by email and role
    const found = mockUsers.find(
      u => u.email === email && u.role === role
    );
    if (!found) {
      // For demo: allow login with any email if role matches a default user
      const defaultUser = mockUsers.find(u => u.role === role);
      if (defaultUser) {
        const userData = { ...defaultUser, email };
        localStorage.setItem('eco_token', 'mock_jwt_' + Date.now());
        localStorage.setItem('eco_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
      }
      throw new Error('Invalid credentials');
    }
    localStorage.setItem('eco_token', 'mock_jwt_' + Date.now());
    localStorage.setItem('eco_user', JSON.stringify(found));
    setUser(found);
    return found;
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
