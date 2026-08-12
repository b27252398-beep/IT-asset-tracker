// src/api/assetApi.js
// ============================================================
// Centralised Axios functions for the IT Asset Tracker API.
// All functions return the response data directly and throw
// a descriptive Error on failure for callers to catch.
// ============================================================

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

// ---- Dashboard ----

/** Returns { TOTAL, AVAILABLE, ASSIGNED, IN_REPAIR, RETIRED } */
export async function fetchDashboardMetrics() {
  const { data } = await api.get('/assets/dashboard');
  return data.data;
}

// ---- Assets ----

/** Returns full asset list. Pass status string to filter. */
export async function fetchAssets(status = '') {
  const params = status ? { status } : {};
  const { data } = await api.get('/assets', { params });
  return data.data;
}

/** Returns a single asset by UUID. */
export async function fetchAssetById(id) {
  const { data } = await api.get(`/assets/${id}`);
  return data.data;
}

/**
 * Creates a new asset.
 * @param {Object} payload - { assetTag, name, category, serialNumber?, location?, notes? }
 */
export async function createAsset(payload) {
  const { data } = await api.post('/assets', payload);
  return data;
}

/**
 * Assigns an available asset to a user.
 * @param {string} id - Asset UUID
 * @param {string} assignedTo - User name
 * @param {string} [performedBy] - Admin performing the action
 */
export async function assignAsset(id, assignedTo, performedBy = 'Admin') {
  const { data } = await api.put(`/assets/${id}/assign`, { assignedTo, performedBy });
  return data;
}

/**
 * Updates an asset's status.
 * @param {string} id - Asset UUID
 * @param {string} status - 'AVAILABLE' | 'IN_REPAIR' | 'RETIRED'
 * @param {string} [notes]
 * @param {string} [performedBy]
 */
export async function updateAssetStatus(id, status, notes = '', performedBy = 'Admin') {
  const { data } = await api.put(`/assets/${id}/status`, { status, notes, performedBy });
  return data;
}

/** Returns assignment history for one asset, newest first. */
export async function fetchAssetLogs(id) {
  const { data } = await api.get(`/assets/${id}/logs`);
  return data;
}
