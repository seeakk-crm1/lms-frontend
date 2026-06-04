import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOverdueMandatoryFollowUps } from '../services/followupService';
import { MANDATORY_FOLLOWUP_QUERY_KEY } from '../constants/mandatoryFollowup.constants';
import useAuthStore from '../store/useAuthStore';

export const OVERDUE_MANDATORY_QUERY_KEY = ['followups', 'overdue-mandatory'] as const;

export const useOverdueMandatoryFollowUpsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: OVERDUE_MANDATORY_QUERY_KEY,
    queryFn: () => getOverdueMandatoryFollowUps(),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403 || status === 423 || status === 503) return false;
      return failureCount < 2;
    },
  });

export const useInvalidateOverdueMandatory = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: OVERDUE_MANDATORY_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: MANDATORY_FOLLOWUP_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ['followups', 'advanced-calendar'] });
    void queryClient.invalidateQueries({ queryKey: ['followups', 'alerts'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };
};

export const useOverdueMandatoryBlocked = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(isAuthenticated && user?.isOnboarded);

  const query = useOverdueMandatoryFollowUpsQuery(enabled);
  const items = query.data?.data?.items ?? [];
  const blocked = Boolean(enabled && query.isSuccess && items.length > 0);

  return {
    blocked,
    enabled,
    items,
    query,
  };
};
