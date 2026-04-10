import { useQuery } from '@tanstack/react-query';
import { getReportTypes } from '../../../services/reportTypes.api';
import useReportTypeStore from '../store/reportTypeStore';

export const useReportTypesQuery = () => {
  const { search, filters, page, limit } = useReportTypeStore();

  return useQuery({
    queryKey: ['report-types', { search, filters, page, limit }],
    queryFn: () =>
      getReportTypes({
        page,
        limit,
        search: search.trim() || undefined,
        status: filters.status || undefined,
        module: filters.module || undefined,
      }),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 422) return false;
      return failureCount < 1;
    },
  });
};
