import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRole, updateRole, deleteRole } from '../services/role.api';
import { CreateRoleInput, UpdateRoleInput } from '../types/role.types';
import { toast } from 'react-hot-toast';

export const useRoleMutations = () => {
  const queryClient = useQueryClient();

  const getDeleteRoleErrorMessage = (error: any) => {
    const data = error?.response?.data;

    if (data?.code === 'ROLE_HAS_USERS') {
      const assignedUsersCount = data?.details?.assignedUsersCount;
      if (typeof assignedUsersCount === 'number') {
        return `Cannot delete role while ${assignedUsersCount} user${assignedUsersCount === 1 ? '' : 's'} are assigned to it. Reassign them first.`;
      }
      return 'Cannot delete a role that still has assigned users. Reassign them first.';
    }

    if (data?.code === 'ROLE_SYSTEM_PROTECTED') {
      return data?.message || 'System protected roles cannot be deleted.';
    }

    return data?.message || 'Failed to delete role';
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleInput) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create role');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) => updateRole(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['role', id] });
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      toast.error(getDeleteRoleErrorMessage(error));
    }
  });

  return {
    createRole: createMutation,
    updateRole: updateMutation,
    deleteRole: deleteMutation,
  };
};
