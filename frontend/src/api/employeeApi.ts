import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// --- Request interceptor: attach token ---
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: normalise error messages ---
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const serverMsg =
      err.response?.data?.message ||
      err.response?.data ||
      err.message ||
      'Unknown error';
    return Promise.reject(new Error(String(serverMsg)));
  }
);

/** Returns full employee list. */
export async function fetchEmployees() {
  const { data } = await api.get('/employees');
  return data.data;
}
