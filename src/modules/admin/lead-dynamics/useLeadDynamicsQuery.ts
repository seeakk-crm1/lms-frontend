import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useLeadDynamicsStore } from './leadDynamics.store';
import type { ListLeadDynamicsResponse } from './types';

const getLeadDynamics = async (params: Record<string, unknown>): Promise<ListLeadDynamicsResponse> => {
  const response = await api.get('/admin/lead-dynamics', { params });
  return response.data;
};

export const useLeadDynamicsQuery = () => {
  const { filters, pagination } = useLeadDynamicsStore();

  return useQuery<ListLeadDynamicsResponse, Error>({
    queryKey: [
      'lead-dynamics',
      filters.search,
      filters.status,
      pagination.page,
      pagination.limit,
    ],
    queryFn: () =>
      getLeadDynamics({
        search: filters.search || undefined,
        isActive:
          filters.status === 'ALL'
            ? undefined
            : filters.status === 'ACTIVE'
              ? 'true'
              : 'false',
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
