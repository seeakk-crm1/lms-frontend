import api from './api';

export const getTargetDashboardAnalytics = async () => {
  const response = await api.get('/targets/analytics/dashboard');
  return response.data;
};

export const getTargetPerformanceReport = async () => {
  const response = await api.get('/targets/analytics/report');
  return response.data;
};

export const listLockedStaff = async () => {
  const response = await api.get('/targets/locked-staff');
  return response.data;
};

export const unlockTargetStaff = async (userId: string, reason?: string) => {
  const response = await api.post(`/targets/unlock/${userId}`, { reason });
  return response.data;
};

export const extendTargetGrace = async (userId: string, graceUntil: string, reason?: string) => {
  const response = await api.post(`/targets/grace/${userId}`, { graceUntil, reason });
  return response.data;
};

export const assignUserTargetCycle = async (userId: string, targetCycleId: string | null) => {
  const response = await api.put(`/targets/assign/${userId}`, { targetCycleId });
  return response.data;
};

export const assignUserTargetCycleAdmin = async (userId: string, targetCycleId: string | null) => {
  const response = await api.put(`/admin/users/${userId}/target-cycle`, { targetCycleId });
  return response.data;
};
