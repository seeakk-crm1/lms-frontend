import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getMandatoryFollowUpContinuation,
  saveMandatoryFollowUpContinuation,
} from '../services/followupService';
import type { SaveMandatoryFollowUpContinuationInput } from '../types/mandatoryFollowup.types';

export const MANDATORY_FOLLOWUP_QUERY_KEY = ['followups', 'mandatory-continuation'] as const;

export const useMandatoryFollowUpContinuationQuery = (enabled = true) =>
  useQuery({
    queryKey: MANDATORY_FOLLOWUP_QUERY_KEY,
    queryFn: getMandatoryFollowUpContinuation,
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 503) return false;
      return failureCount < 2;
    },
    select: (response) => response.data,
  });

export const useSaveMandatoryFollowUpContinuationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveMandatoryFollowUpContinuationInput) => saveMandatoryFollowUpContinuation(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(MANDATORY_FOLLOWUP_QUERY_KEY, {
        success: true,
        message: response.message,
        data: response.data?.session ?? {
          mandatoryFollowupRequired: false,
          mandatoryFollowupCount: 0,
          items: [],
        },
      });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Next follow-up scheduled. You can continue working.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to schedule the next follow-up.');
    },
  });
};
