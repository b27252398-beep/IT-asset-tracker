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

export async function fetchMaintenanceSchedules() {
  const { data } = await api.get('/maintenance-schedules');
  return data.data;
}

export async function createMaintenanceSchedule(schedule: any) {
  const { data } = await api.post('/maintenance-schedules', schedule);
  return data;
}

export async function updateMaintenanceSchedule(id: string, updates: any) {
  const { data } = await api.put(`/maintenance-schedules/${id}`, updates);
  return data;
}

export async function deleteMaintenanceSchedule(id: string) {
  const { data } = await api.delete(`/maintenance-schedules/${id}`);
  return data;
}
