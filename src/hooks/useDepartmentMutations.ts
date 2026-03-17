import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDepartment, updateDepartment, deleteDepartment } from '../services/department.api';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../types/department.types';
import { toast } from 'react-hot-toast';

export const useDepartmentMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentInput) => createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create department');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentInput }) => updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update department');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  });

  return {
    createDepartment: createMutation,
    updateDepartment: updateMutation,
    deleteDepartment: deleteMutation,
  };
};
