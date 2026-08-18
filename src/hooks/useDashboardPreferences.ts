import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getDashboardPreferences,
  updateDashboardPreferences,
  resetDashboardPreferences,
} from '../services/dashboardPreferences.api';
import type { UpdateDashboardPreferencesInput } from '../types/dashboardPreferences.types';

export const DASHBOARD_PREFERENCES_QUERY_KEY = ['dashboardPreferences'] as const;

export const useDashboardPreferencesQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: DASHBOARD_PREFERENCES_QUERY_KEY,
    queryFn: () => getDashboardPreferences(),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateDashboardPreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDashboardPreferencesInput) => updateDashboardPreferences(payload),
    onSuccess: (data) => {
      toast.success('Dashboard updated successfully.');
      queryClient.setQueryData(DASHBOARD_PREFERENCES_QUERY_KEY, data);
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_PREFERENCES_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to save dashboard preferences.';
      toast.error(msg);
    },
  });
};

export const useResetDashboardPreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resetDashboardPreferences(),
    onSuccess: (data) => {
      toast.success('Dashboard layout reset to default.');
      queryClient.setQueryData(DASHBOARD_PREFERENCES_QUERY_KEY, data);
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_PREFERENCES_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to reset dashboard layout.';
      toast.error(msg);
    },
  });
};
