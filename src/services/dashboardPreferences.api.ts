import api from './api';
import type {
  DashboardPreferencesPayload,
  UpdateDashboardPreferencesInput,
} from '../types/dashboardPreferences.types';

export const getDashboardPreferences = async (): Promise<DashboardPreferencesPayload> => {
  const response = await api.get('/dashboard/preferences');
  return response.data?.data;
};

export const updateDashboardPreferences = async (
  payload: UpdateDashboardPreferencesInput
): Promise<DashboardPreferencesPayload> => {
  const response = await api.put('/dashboard/preferences', payload);
  return response.data?.data;
};

export const resetDashboardPreferences = async (): Promise<DashboardPreferencesPayload> => {
  const response = await api.post('/dashboard/preferences/reset');
  return response.data?.data;
};
