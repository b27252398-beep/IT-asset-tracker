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

export async function fetchLocations() {
  const { data } = await api.get('/locations');
  return data.data;
}

export async function createLocation(location: any) {
  const { data } = await api.post('/locations', location);
  return data;
}

export async function updateLocation(id: string, updates: any) {
  const { data } = await api.put(`/locations/${id}`, updates);
  return data;
}

export async function deleteLocation(id: string) {
  const { data } = await api.delete(`/locations/${id}`);
  return data;
}
