import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eco_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eco_token');
      localStorage.removeItem('eco_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

// Users
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};

// Schools
export const schoolsAPI = {
  getAll: () => api.get('/schools'),
  getById: (id) => api.get(`/schools/${id}`),
};

// Topics
export const topicsAPI = {
  getAll: () => api.get('/topics'),
  getById: (id) => api.get(`/topics/${id}`),
};

// Lessons
export const lessonsAPI = {
  getByTopic: (topicId) => api.get(`/lessons/topic/${topicId}`),
  getById: (id) => api.get(`/lessons/${id}`),
  markComplete: (id) => api.post(`/lessons/${id}/complete`),
};

// Quizzes
export const quizzesAPI = {
  getByTopic: (topicId) => api.get(`/quizzes/topic/${topicId}`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
};

// Missions
export const missionsAPI = {
  getAll: () => api.get('/missions'),
  getById: (id) => api.get(`/missions/${id}`),
  submit: (id, data) => api.post(`/missions/${id}/submit`, data),
};

// Submissions
export const submissionsAPI = {
  getAll: (params) => api.get('/submissions', { params }),
  getById: (id) => api.get(`/submissions/${id}`),
  approve: (id) => api.put(`/submissions/${id}/approve`),
  reject: (id) => api.put(`/submissions/${id}/reject`),
};

// Leaderboards
export const leaderboardsAPI = {
  getClass: (classId) => api.get(`/leaderboards/class/${classId}`),
  getSchool: (schoolId) => api.get(`/leaderboards/school/${schoolId}`),
  getCompetition: (compId) => api.get(`/leaderboards/competition/${compId}`),
};

// Competitions
export const competitionsAPI = {
  getAll: () => api.get('/competitions'),
  getById: (id) => api.get(`/competitions/${id}`),
  create: (data) => api.post('/competitions', data),
};

// Analytics
export const analyticsAPI = {
  getStudent: (id) => api.get(`/analytics/student/${id}`),
  getClass: (id) => api.get(`/analytics/class/${id}`),
  getSchool: (id) => api.get(`/analytics/school/${id}`),
  getPlatform: () => api.get('/analytics/platform'),
};

// Badges
export const badgesAPI = {
  getAll: () => api.get('/badges'),
  getByUser: (userId) => api.get(`/badges/user/${userId}`),
};

// Points
export const pointsAPI = {
  getHistory: (userId) => api.get(`/points/history/${userId}`),
};

// Tasks (teacher assigns → student sees)
export const tasksAPI = {
  getByClass: (classId) => api.get('/tasks', { params: { classId } }),
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
};

// AI Service — all calls go through the Express server (/api/ai/...)
// so they work in both local dev (proxied by Vite) and on Vercel (rewritten by vercel.json).
export const aiAPI = {
  verifyImage: (data) => api.post('/ai/verify-image', data),
  personalizeLearning: (data) => api.post('/ai/personalize-learning', data),
  getClassInsights: (classId) => api.get(`/ai/class-insights/${classId}`),
  chat: (data) => api.post('/ai/chat', data),
};

export default api;
