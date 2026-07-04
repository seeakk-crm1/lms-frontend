import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOverdueMandatoryFollowUps } from '../services/followupService';
import { MANDATORY_FOLLOWUP_QUERY_KEY } from '../constants/mandatoryFollowup.constants';
import { useAuthenticatedWorkflowEnabled } from './useAuthenticatedWorkflowEnabled';

export const OVERDUE_MANDATORY_QUERY_KEY = ['followups', 'overdue-mandatory'] as const;

export const useOverdueMandatoryFollowUpsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: OVERDUE_MANDATORY_QUERY_KEY,
    queryFn: () => getOverdueMandatoryFollowUps(),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      if (!error?.response && error?.message === 'Network Error') return false;
      const status = error?.response?.status;
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
  const enabled = useAuthenticatedWorkflowEnabled();

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
