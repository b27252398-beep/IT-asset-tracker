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

export async function fetchPurchaseOrders() {
  const { data } = await api.get('/purchase-orders');
  return data.data;
}

export async function createPurchaseOrder(po: any) {
  const { data } = await api.post('/purchase-orders', po);
  return data;
}

export async function updatePurchaseOrder(id: string, updates: any) {
  const { data } = await api.put(`/purchase-orders/${id}`, updates);
  return data;
}

export async function deletePurchaseOrder(id: string) {
  const { data } = await api.delete(`/purchase-orders/${id}`);
  return data;
}
