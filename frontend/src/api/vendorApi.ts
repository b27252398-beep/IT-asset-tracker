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

export async function fetchVendors() {
  const { data } = await api.get('/vendors');
  return data.data;
}

export async function createVendor(vendor: any) {
  const { data } = await api.post('/vendors', vendor);
  return data;
}

export async function updateVendor(id: string, updates: any) {
  const { data } = await api.put(`/vendors/${id}`, updates);
  return data;
}

export async function deleteVendor(id: string) {
  const { data } = await api.delete(`/vendors/${id}`);
  return data;
}
