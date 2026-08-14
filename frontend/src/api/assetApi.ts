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

/** Returns warranty alerts */
export async function fetchWarrantyAlerts() {
  const { data } = await api.get('/assets/warranty-alerts');
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
 * Updates an asset's details.
 * @param {string} id - Asset UUID
 * @param {Object} payload - { name, assetTag, category, location, status }
 */
export async function updateAsset(id, payload) {
  const { data } = await api.put(`/assets/${id}/edit`, payload);
  return data;
}

/**
 * Checks out an available asset to an employee.
 * @param {string} id - Asset UUID
 * @param {string} employeeId - Employee UUID
 * @param {string} [performedBy] - Admin performing the action
 */
export async function checkOutAsset(id, employeeId, performedBy = 'Admin') {
  const { data } = await api.put(`/assets/${id}/assign`, { employeeId, performedBy });
  return data;
}

/**
 * Checks in an assigned asset from an employee.
 * @param {string} id - Asset UUID
 * @param {string} [notes] - Optional notes
 * @param {string} [performedBy] - Admin performing the action
 */
export async function checkInAsset(id, notes = '', performedBy = 'Admin') {
  const { data } = await api.put(`/assets/${id}/checkin`, { notes, performedBy });
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

/** Returns maintenance history for one asset */
export async function fetchMaintenanceLogs(id) {
  const { data } = await api.get(`/assets/${id}/maintenance`);
  return data.data;
}

/** Logs a new maintenance record */
export async function createMaintenanceRecord(id, payload) {
  const { data } = await api.post(`/assets/${id}/maintenance`, payload);
  return data;
}

/** Updates a maintenance record */
export async function updateMaintenanceRecord(maintenanceId: string, payload: any) {
  const { data } = await api.put(`/maintenance/${maintenanceId}`, payload);
  return data;
}

// Document Upload APIs
export const fetchAssetDocuments = async (assetId: string) => {
  const response = await api.get(`/assets/${assetId}/documents`);
  return response.data.data;
};

export const uploadAssetDocument = async (assetId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/assets/${assetId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

/** Downloads the CSV report of all assets */
export async function downloadAssetsCSV() {
  const response = await api.get('/reports/assets/csv', {
    responseType: 'blob', // Important for downloading files
  });
  
  // Create a link to download the blob
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'IT_Assets_Inventory_Report.csv');
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/** Bulk imports assets from parsed JSON array */
export async function importAssetsCSV(assetsArray) {
  const { data } = await api.post('/assets/import', { assets: assetsArray });
  return data;
}
