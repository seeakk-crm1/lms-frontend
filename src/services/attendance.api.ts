import api from './api';

export const getTodayStatus = async () => {
  const response = await api.get('/attendance/today');
  return response.data;
};

export const markAttendance = async (data: { attendanceType: string; checkInTime?: string | null; date?: string }) => {
  const response = await api.post('/attendance/check-in', data);
  return response.data;
};

export const getHistory = async (filters: any) => {
  const response = await api.get('/attendance/history', { params: filters });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/attendance/stats');
  return response.data;
};

export const getAdminOverview = async (filters: any) => {
  const response = await api.get('/attendance/admin-overview', { params: filters });
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/attendance/admin-stats');
  return response.data;
};

export const getSettings = async () => {
  const response = await api.get('/attendance/settings');
  return response.data;
};

export const updateSettings = async (data: any) => {
  const response = await api.put('/attendance/settings', data);
  return response.data;
};

export const unlockUser = async (userId: string) => {
  const response = await api.post(`/attendance/unlock/${userId}`);
  return response.data;
};

export const exportAttendance = async (filters: any) => {
  const response = await api.get('/attendance/export', { params: filters, responseType: 'blob' });
  return response.data;
};
