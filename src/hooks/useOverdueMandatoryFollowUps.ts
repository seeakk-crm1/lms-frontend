import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOverdueMandatoryFollowUps } from '../services/followupService';
import { MANDATORY_FOLLOWUP_QUERY_KEY } from '../constants/mandatoryFollowup.constants';

export const OVERDUE_MANDATORY_QUERY_KEY = ['followups', 'overdue-mandatory'] as const;

export const useOverdueMandatoryFollowUpsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: OVERDUE_MANDATORY_QUERY_KEY,
    queryFn: () => getOverdueMandatoryFollowUps(),
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

export const useInvalidateOverdueMandatory = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: OVERDUE_MANDATORY_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: MANDATORY_FOLLOWUP_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ['followups', 'advanced-calendar'] });
  };
};

export const useOverdueMandatoryBlocked = () => {
  const query = useOverdueMandatoryFollowUpsQuery(true);
  const items = query.data?.data?.items ?? [];
  const blocked = Boolean(query.isSuccess && items.length > 0);

  return {
    blocked,
    items,
    query,
  };
};
