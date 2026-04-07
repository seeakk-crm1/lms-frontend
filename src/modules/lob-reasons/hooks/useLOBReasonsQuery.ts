import { useQuery } from '@tanstack/react-query';
import { getLOBReasons } from '../../../services/lobReasons.api';
import useLOBStore from '../store/lobReasonStore';

export const useLOBReasonsQuery = () => {
  const { search, status, page, limit } = useLOBStore();

  return useQuery({
    queryKey: ['lob-reasons', { search, status, page, limit }],
    queryFn: () =>
      getLOBReasons({
        page,
        limit,
        search: search.trim() || undefined,
        status: status === 'ALL' ? undefined : status,
      }),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const responseStatus = error?.response?.status;
      if (responseStatus === 401 || responseStatus === 403 || responseStatus === 422) return false;
      return failureCount < 1;
    },
  });
};

export const useActiveLOBReasonsQuery = (enabled = true) =>
  useQuery({
    queryKey: ['lob-reasons', 'active'],
    queryFn: () =>
      getLOBReasons({
        page: 1,
        limit: 100,
        status: 'ACTIVE',
      }),
    select: (response) => response.data,
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });
