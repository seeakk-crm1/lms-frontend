import { useQuery } from '@tanstack/react-query';
import { getStageRules } from '../services/stageRule.api';
import { ListStageRulesResponse } from '../types/stageRule.types';
import useStageRuleStore from '../store/stageRuleStore';

export const useStageRulesQuery = () => {
  const { filters, pagination } = useStageRuleStore();

  return useQuery<ListStageRulesResponse, Error>({
    queryKey: ['stage-rules', filters.search, filters.status, pagination.page, pagination.limit],
    queryFn: async () =>
      getStageRules({
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
