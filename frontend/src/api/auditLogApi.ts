import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchAuditLogs() {
  const { data } = await api.get('/audit-logs');
  return data.data;
}

export async function createAuditLog(log: any) {
  const { data } = await api.post('/audit-logs', log);
  return data;
}
