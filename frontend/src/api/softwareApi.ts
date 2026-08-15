import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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

export async function fetchSoftware() {
  const { data } = await api.get('/software');
  return data.data;
}

export async function createSoftware(software: any) {
  const { data } = await api.post('/software', software);
  return data;
}

export async function updateSoftware(id: string, updates: any) {
  const { data } = await api.put(`/software/${id}`, updates);
  return data;
}

export async function deleteSoftware(id: string) {
  const { data } = await api.delete(`/software/${id}`);
  return data;
}
