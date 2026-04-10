import { useQuery } from '@tanstack/react-query';
import { getLeadStages, getLifeCycles } from '../../../services/admin/lead-life-cycle/leadLifeCycleService';
import { useLeadLifeCycleStore } from '../../../store/admin/lead-life-cycle/leadLifeCycleStore';
import type {
  LeadStageOption,
  ListLeadLifeCyclesResponse,
} from '../../../types/admin/lead-life-cycle/leadLifeCycle.types';

export const useLifeCyclesQuery = () => {
  const { filters, pagination } = useLeadLifeCycleStore();

  return useQuery<ListLeadLifeCyclesResponse, Error>({
    queryKey: ['lead-life-cycles', filters.search, pagination.page, pagination.limit],
    queryFn: () =>
      getLifeCycles({
        search: filters.search || undefined,
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

export const useLeadStageOptionsQuery = () =>
  useQuery<LeadStageOption[], Error>({
    queryKey: ['lead-life-cycle', 'stage-options'],
    queryFn: getLeadStages,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
