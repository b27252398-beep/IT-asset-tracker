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

export async function fetchConsumables() {
  const { data } = await api.get('/consumables');
  return data.data;
}

export async function createConsumable(item: any) {
  const { data } = await api.post('/consumables', item);
  return data;
}

export async function updateConsumable(id: string, updates: any) {
  const { data } = await api.put(`/consumables/${id}`, updates);
  return data;
}

export async function deleteConsumable(id: string) {
  const { data } = await api.delete(`/consumables/${id}`);
  return data;
}
