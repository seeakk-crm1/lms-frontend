import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../services/users.api';
import { resendInviteAPI, sendInviteAPI } from '../services/invite.api';
import { toast } from 'react-hot-toast';

const handleManualInviteDelivery = async (response: { message?: string; inviteLink?: string | null }) => {
  const inviteLink = response?.inviteLink || '';
  const baseMessage = response?.message || 'Invite is ready for manual sharing.';
  if (!inviteLink) {
    toast(baseMessage, { duration: 7000 });
    return;
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(inviteLink);
      toast(
        `${baseMessage} Invite link copied to clipboard.`,
        { duration: 7000 },
      );
      return;
    }
  } catch {
    // Fall through to showing the raw link in toast.
  }

  toast(
    `${baseMessage} Link: ${inviteLink}`,
    { duration: 9000 },
  );
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message || 'User created successfully');
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => 
      usersApi.updateUser(id, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      toast.success(response.message || 'User updated successfully');
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message || 'User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });
};

export const useUpdateStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      usersApi.updateUserStatus(id, isActive),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message || 'Status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};

export const useAssignTargetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: any }) => 
      usersApi.assignTarget(userId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-targets', variables.userId] });
      toast.success(response.message || 'Target assigned');
    },
  });
};

export const useUnlockUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.unlockUser,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(response.message || 'User unlocked');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unlock user');
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: any }) =>
      usersApi.resetPassword(id, payload ?? {}),
  });
};

export const useSendInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => sendInviteAPI(userId),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (response.delivery === 'MANUAL') {
        await handleManualInviteDelivery(response);
        return;
      }

      toast.success(response.message || 'Invite email sent');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send invite');
    },
  });
};

export const useResendInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => resendInviteAPI(inviteId),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (response.delivery === 'MANUAL') {
        await handleManualInviteDelivery(response);
        return;
      }

      toast.success(response.message || 'Invite resent successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to resend invite');
    },
  });
};
