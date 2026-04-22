import { useQuery } from '@tanstack/react-query';
import { getLeadSources } from '../services/leadSource.api';
import { ListLeadSourcesResponse } from '../types/leadSource.types';
import useLeadSourceStore from '../store/leadSourceStore';

export const useLeadSourcesQuery = () => {
  const { filters, pagination } = useLeadSourceStore();

  return useQuery<ListLeadSourcesResponse, Error>({
    queryKey: ['lead-sources', filters.search, filters.status, pagination.page, pagination.limit],
    queryFn: async (): Promise<ListLeadSourcesResponse> =>
      getLeadSources({
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
