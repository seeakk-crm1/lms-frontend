import { useQuery } from '@tanstack/react-query';
import { getLeadStages } from '../services/leadStage.api';
import { ListLeadStagesResponse } from '../types/leadStage.types';
import useLeadStageStore from '../store/leadStageStore';

export const useLeadStagesQuery = () => {
  const { filters, pagination } = useLeadStageStore();

  return useQuery<ListLeadStagesResponse, Error>({
    queryKey: ['lead-stages', filters.search, filters.status, pagination.page, pagination.limit],
    queryFn: async () =>
      getLeadStages({
        search: filters.search,
        status: filters.status,
        page: pagination.page,
        limit: pagination.limit,
      }),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });
};

