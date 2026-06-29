/**
 * OPMAS-001 | API Service
 * Single place where all backend calls live.
 * Swap MOCK_MODE to false once the Laravel API is live.
 */

import axios from 'axios';

const MOCK_MODE = false;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('opmas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Sensor endpoints ─────────────────────────────────────────────────────────

export const getLatestReadings = async () => {
  if (MOCK_MODE) return mockLatest();
  const { data } = await api.get('/sensors/latest');
  return data;
};

export const getSensorHistory = async (register, from, to) => {
  if (MOCK_MODE) return mockHistory(register, from, to);
  const { data } = await api.get('/sensors/history', { params: { register, from, to } });
  return data;
};

// ── Alarm endpoints ──────────────────────────────────────────────────────────

export const getAlarms = async () => {
  if (MOCK_MODE) return mockAlarms();
  const { data } = await api.get('/alarms');
  return data;
};

export const resolveAlarm = async (id) => {
  const { data } = await api.post(`/alarms/${id}/resolve`);
  return data;
};

// ── Equipment endpoints ──────────────────────────────────────────────────────

export const getEquipment = async () => {
  const { data } = await api.get('/equipment');
  return data;
};

// ── Auth endpoints ───────────────────────────────────────────────────────────

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('opmas_token');
};

// ── Collector status ─────────────────────────────────────────────────────────

export const getCollectorStatus = async () => {
  if (MOCK_MODE) return { alive: true, last_seen: new Date().toISOString(), failures: 0 };
  const { data } = await api.get('/collector/heartbeat');
  return data;
};
