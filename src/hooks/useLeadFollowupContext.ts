import { useQuery } from '@tanstack/react-query';
import { getLeadFollowupContext, FollowupContextData } from '../services/followupContext.api';

export const useLeadFollowupContext = (leadId?: string) => {
  return useQuery<FollowupContextData>({
    queryKey: ['lead-followup-context', leadId],
    queryFn: () => getLeadFollowupContext(leadId!),
    enabled: !!leadId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes to prevent redundant requests
  });
};
