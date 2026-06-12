import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  forgotPasswordAPI,
  resetPasswordAPI,
  validateResetTokenAPI,
  type ResetPasswordPayload,
} from '../services/passwordReset.api';

const shouldRetry = (failureCount: number, error: any) => {
  const status = error?.response?.status;
  if (status === 400 || status === 404 || status === 410 || status === 422 || status === 429) {
    return false;
  }
  return failureCount < 1;
};

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: (email: string) => forgotPasswordAPI(email),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send the reset link. Please try again.');
    },
  });

export const useResetTokenValidation = (token: string) =>
  useQuery({
    queryKey: ['password-reset-validation', token],
    queryFn: () => validateResetTokenAPI(token),
    enabled: token.trim().length > 0,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: shouldRetry,
  });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPasswordAPI(payload),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reset the password. Please try again.');
    },
  });
