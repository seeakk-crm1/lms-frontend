import api from './api';

export const getTodayStatus = async () => {
  const response = await api.get('/attendance/today');
  return response.data;
};

export const markAttendance = async (data: {
  attendanceType: string;
  checkInTime?: string | null;
  date?: string;
  latitude?: number | null;
  longitude?: number | null;
  gpsAccuracy?: number | null;
  locationCapturedAt?: string | null;
  deviceInfo?: string | null;
  geoLocation?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
  clientChannel?: 'web' | 'mobile';
}) => {
  const response = await api.post('/attendance/check-in', data);
  return response.data;
};

export const checkOutAttendance = async (data: {
  checkOutTime?: string | null;
  date?: string;
  dailySummary: string;
  notes?: string | null;
  attachmentUrl?: string | null;
}) => {
  const response = await api.post('/attendance/check-out', data);
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

export const getAttendanceUserSettings = async () => {
  const response = await api.get('/attendance/user-settings');
  return response.data;
};

export const updateAttendanceUserSetting = async (
  userId: string,
  data: { expectedCheckInTime: string; expectedCheckOutTime: string },
) => {
  const response = await api.put(`/attendance/user-settings/${userId}`, data);
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

export const getPendingApprovals = async () => {
  const response = await api.get('/attendance/pending');
  return response.data;
};

export const reviewAttendance = async (recordId: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
  const response = await api.post(`/attendance/review/${recordId}`, { action, reason });
  return response.data;
};

export const updateUserApplyType = async (userId: string, applyType: string) => {
  const response = await api.put(`/attendance/apply-type/${userId}`, { attendanceApplyType: applyType });
  return response.data;
};

export const updateUserOfficeBranch = async (userId: string, attendanceOfficeLocationId: string | null) => {
  const response = await api.put(`/attendance/office-branch/${userId}`, { attendanceOfficeLocationId });
  return response.data;
};

export const getOfficeLocations = async () => {
  const response = await api.get('/attendance/locations');
  return response.data;
};

export const createOfficeLocation = async (data: any) => {
  const response = await api.post('/attendance/locations', data);
  return response.data;
};

export const updateOfficeLocation = async (id: string, data: any) => {
  const response = await api.put(`/attendance/locations/${id}`, data);
  return response.data;
};

export const deleteOfficeLocation = async (id: string) => {
  const response = await api.delete(`/attendance/locations/${id}`);
  return response.data;
};

export const getNetworks = getOfficeLocations;
export const createNetwork = createOfficeLocation;
export const updateNetwork = updateOfficeLocation;
export const deleteNetwork = deleteOfficeLocation;

export const getNotifications = async () => {
  const response = await api.get('/attendance/notifications');
  return response.data;
};
