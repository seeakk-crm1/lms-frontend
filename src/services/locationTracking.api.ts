import api from './api';

export interface LocationPointPayload {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  batteryPercentage?: number | null;
  recordedAt: string;
  deviceType?: string | null;
  source?: string;
}

export interface LiveLocationUser {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    employeeId?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
    department?: string | null;
    office?: string | null;
  };
  sessionId?: string | null;
  attendanceRecordId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  batteryPercentage?: number | null;
  lastUpdatedAt?: string | null;
  status: 'Moving' | 'Stopped' | 'Offline' | string;
  trackingStatus?: string | null;
  address?: string | null;
}

export interface RouteResponse {
  range: { start: string; end: string };
  sessions: any[];
  points: Array<LocationPointPayload & { id: string }>;
  stops: Array<{
    latitude: number;
    longitude: number;
    startedAt: string;
    endedAt?: string;
    durationSeconds: number;
  }>;
  stats: {
    totalDistanceMeters: number;
    totalDistanceKm: number;
    movingSeconds: number;
    stopSeconds: number;
    averageSpeedKmh: number;
    maxSpeedKmh: number;
    numberOfStops: number;
    firstCheckIn?: string | null;
    lastCheckOut?: string | null;
  };
}

export const startLocationSession = async (payload: { attendanceRecordId?: string; deviceType?: string | null }) => {
  const { data } = await api.post('/location-tracking/sessions/start', payload);
  return data;
};

export const stopLocationSession = async (payload: { sessionId?: string; attendanceRecordId?: string }) => {
  const { data } = await api.post('/location-tracking/sessions/stop', payload);
  return data;
};

export const pushLocationPoints = async (payload: {
  sessionId?: string;
  attendanceRecordId?: string;
  points: LocationPointPayload[];
}) => {
  console.log('[Location Tracking] Request Started -> POST /location-tracking/points');
  const tokenExists = Boolean(localStorage.getItem('accessToken'));
  console.log(`[Location Tracking] Authorization Token Found: ${tokenExists}`);
  console.log('[Location Tracking] Sending Request...');
  try {
    const { data, status } = await api.post('/location-tracking/points', payload);
    console.log(`[Location Tracking] Response Received -> Status Code: ${status}`);
    console.log('[Location Tracking] Request Completed Successfully');
    return data;
  } catch (error: any) {
    const status = error.response?.status;
    console.warn(`[Location Tracking] Response Received -> Error Status Code: ${status || 'Network Error'}`);
    throw error;
  }
};

export const getLocationPoints = async (params?: {
  userId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}) => {
  console.log('[Location Tracking] Request Started -> GET /location-tracking/points');
  const tokenExists = Boolean(localStorage.getItem('accessToken'));
  console.log(`[Location Tracking] Authorization Token Found: ${tokenExists}`);
  console.log('[Location Tracking] Sending Request...');
  try {
    const { data, status } = await api.get('/location-tracking/points', { params });
    console.log(`[Location Tracking] Response Received -> Status Code: ${status}`);
    console.log('[Location Tracking] Request Completed Successfully');
    return data;
  } catch (error: any) {
    const status = error.response?.status;
    console.warn(`[Location Tracking] Response Received -> Error Status Code: ${status || 'Network Error'}`);
    throw error;
  }
};

export const getLiveLocations = async (params?: { userId?: string }): Promise<LiveLocationUser[]> => {
  const { data } = await api.get('/location-tracking/live', { params });
  return data?.data || [];
};

export const getLocationRoute = async (params: {
  userId: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}): Promise<RouteResponse> => {
  const { data } = await api.get('/location-tracking/route', { params });
  return data?.data;
};

export const exportLocationRoute = async (params: {
  userId: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const { data } = await api.get('/location-tracking/export', { params, responseType: 'blob' });
  return data;
};
