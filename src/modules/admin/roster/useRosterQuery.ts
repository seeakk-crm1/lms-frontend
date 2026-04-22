import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useRosterStore } from './roster.store';
import type { RosterEntriesApiResponse, RosterUsersApiResponse } from './types';

const getRosterUsers = async (params: Record<string, unknown>): Promise<RosterUsersApiResponse> => {
  const response = await api.get('/admin/roster/users', { params });
  return response.data;
};

const getRosterEntries = async (userId: string): Promise<RosterEntriesApiResponse> => {
  const response = await api.get(`/admin/roster/${userId}`);
  return response.data;
};

export const useRosterUsersQuery = () => {
  const { filters, pagination } = useRosterStore();

  return useQuery<RosterUsersApiResponse, Error>({
    queryKey: [
      'roster-users',
      filters.search,
      filters.departmentId,
      filters.supervisorId,
      filters.status,
      pagination.page,
      pagination.limit,
    ],
    queryFn: () =>
      getRosterUsers({
        search: filters.search || undefined,
        departmentId: filters.departmentId || undefined,
        supervisorId: filters.supervisorId || undefined,
        status: filters.status || undefined,
        page: pagination.page,
        limit: pagination.limit,
      }),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useRosterEntriesQuery = (userId: string | null, enabled = true) =>
  useQuery<RosterEntriesApiResponse, Error>({
    queryKey: ['roster-entries', userId],
    queryFn: () => getRosterEntries(userId!),
    enabled: Boolean(userId) && enabled,
    staleTime: 30_000,
    gcTime: 180_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });
