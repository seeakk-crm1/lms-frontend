import api from './api';

export const getTodayStatus = async () => {
  const response = await api.get('/attendance/today');
  return response.data;
};

export const markAttendance = async (data: {
  attendanceType: string;
  checkInTime?: string | null;
  date?: string;
  ipAddress?: string | null;
  networkName?: string | null;
  routerIp?: string | null;
  subnet?: string | null;
  deviceInfo?: string | null;
  geoLocation?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
  clientChannel?: 'web' | 'mobile';
}) => {
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

// Pending Approvals
export const getPendingApprovals = async () => {
  const response = await api.get('/attendance/pending');
  return response.data;
};

export const reviewAttendance = async (recordId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
  const response = await api.post(`/attendance/review/${recordId}`, { action, reason });
  return response.data;
};

// User list setting inline updates
export const updateUserApplyType = async (userId: string, applyType: string) => {
  const response = await api.put(`/attendance/apply-type/${userId}`, { attendanceApplyType: applyType });
  return response.data;
};

// Network settings CRUD
export const getNetworks = async () => {
  const response = await api.get('/attendance/networks');
  return response.data;
};

export const createNetwork = async (data: any) => {
  const response = await api.post('/attendance/networks', data);
  return response.data;
};

export const updateNetwork = async (id: string, data: any) => {
  const response = await api.put(`/attendance/networks/${id}`, data);
  return response.data;
};

export const deleteNetwork = async (id: string) => {
  const response = await api.delete(`/attendance/networks/${id}`);
  return response.data;
};

// Notifications list
export const getNotifications = async () => {
  const response = await api.get('/attendance/notifications');
  return response.data;
};
