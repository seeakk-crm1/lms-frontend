import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { acceptInvite, type AcceptInvitePayload, validateInviteToken } from '../services/invite.api';

const shouldRetry = (failureCount: number, error: any) => {
  const status = error?.response?.status;
  if (status === 400 || status === 404 || status === 409 || status === 410 || status === 422) {
    return false;
  }

  return failureCount < 1;
};

export const useInviteValidation = (token: string) =>
  useQuery({
    queryKey: ['invite-validation', token],
    queryFn: () => validateInviteToken(token),
    enabled: token.trim().length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: shouldRetry,
  });

export const useAcceptInviteMutation = () =>
  useMutation({
    mutationFn: (payload: AcceptInvitePayload) => acceptInvite(payload),
    onSuccess: (response) => {
      toast.success(response.message || 'Invitation accepted successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to accept invitation.');
    },
  });
