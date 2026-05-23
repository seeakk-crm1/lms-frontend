import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { useTargetCycleStore } from './targetCycle.store';
import type { ListTargetCyclesResponse, TargetCycle } from './types';

export type TargetCycleDetailResponse = {
  success: boolean;
  message: string;
  data: TargetCycle;
};

const tryFallback = (error: any): boolean => error?.response?.status === 404;

const getTargetCycles = async (params: Record<string, unknown>): Promise<ListTargetCyclesResponse> => {
  try {
    const response = await api.get('/admin/target-cycles', { params });
    return response.data;
  } catch (error: any) {
    if (!tryFallback(error)) throw error;
    const fallbackResponse = await api.get('/master/target-cycles', { params });
    return fallbackResponse.data;
  }
};

const getTargetCycleById = async (id: string): Promise<TargetCycleDetailResponse> => {
  try {
    const response = await api.get(`/admin/target-cycles/${id}`);
    return response.data;
  } catch (error: any) {
    if (!tryFallback(error)) throw error;
    const fallbackResponse = await api.get(`/master/target-cycles/${id}`);
    return fallbackResponse.data;
  }
};

export const useTargetCycleDetailQuery = (id: string | null | undefined, enabled: boolean) =>
  useQuery<TargetCycleDetailResponse, Error>({
    queryKey: ['target-cycle', id],
    queryFn: () => getTargetCycleById(id as string),
    enabled: Boolean(enabled && id),
    staleTime: 0,
    gcTime: 60_000,
  });

export const useTargetCyclesQuery = () => {
  const { filters, pagination } = useTargetCycleStore();

  return useQuery<ListTargetCyclesResponse, Error>({
    queryKey: ['target-cycles', filters.search, filters.status, pagination.page, pagination.limit],
    queryFn: () =>
      getTargetCycles({
        search: filters.search || undefined,
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
