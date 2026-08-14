import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({ baseURL: BASE_URL });

// ---- Fetch all issues ----
export const fetchIssues = async () => {
  const { data } = await api.get('/issues');
  return Array.isArray(data) ? data : [];
};

// ---- Employee: Submit new ticket ----
export const createIssue = async (issueData: any) => {
  const { data } = await api.post('/issues', issueData);
  return data;
};

// ---- Admin: Accept ticket ----
export const acceptIssue = async (id: string) => {
  const { data } = await api.patch(`/issues/${id}/accept`);
  return data;
};

// ---- Admin: Reject ticket with reason ----
export const rejectIssue = async (id: string, rejectionReason: string) => {
  const { data } = await api.patch(`/issues/${id}/reject`, { rejectionReason });
  return data;
};

// ---- Admin: Forward ticket to Tech Team with note ----
export const forwardIssue = async (id: string, techNote: string) => {
  const { data } = await api.patch(`/issues/${id}/forward`, { techNote });
  return data;
};

// ---- Tech Team: Mark In Progress ----
export const markInProgress = async (id: string) => {
  const { data } = await api.patch(`/issues/${id}/progress`);
  return data;
};

// ---- Tech Team: Resolve ticket ----
export const resolveIssue = async (id: string, resolvedNote: string) => {
  const { data } = await api.patch(`/issues/${id}/resolve`, { resolvedNote });
  return data;
};

// ---- Admin: Delete ticket ----
export const deleteIssue = async (id: string) => {
  const { data } = await api.delete(`/issues/${id}`);
  return data;
};
