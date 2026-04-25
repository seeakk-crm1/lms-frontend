import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersApi from '../services/users.api';
import { sendInviteAPI } from '../services/invite.api';
import { toast } from 'react-hot-toast';

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
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (response.delivery === 'MANUAL') {
        toast.success(response.message || 'Invite created. Email is not configured, so share the invite link manually.');
        return;
      }

      toast.success(response.message || 'Invite email sent');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send invite');
    },
  });
};
