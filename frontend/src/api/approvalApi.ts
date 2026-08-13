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

export async function fetchApprovals() {
  const { data } = await api.get('/approvals');
  return data.data;
}

export async function createApproval(approval: any) {
  const { data } = await api.post('/approvals', approval);
  return data;
}

export async function updateApproval(id: string, updates: any) {
  const { data } = await api.put(`/approvals/${id}`, updates);
  return data;
}

export async function deleteApproval(id: string) {
  const { data } = await api.delete(`/approvals/${id}`);
  return data;
}
