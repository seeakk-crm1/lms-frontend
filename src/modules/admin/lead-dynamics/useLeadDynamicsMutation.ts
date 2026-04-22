import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import type {
  LeadDynamicField,
  LeadDynamicsFormValues,
  LeadDynamicsMutationResponse,
  ListLeadDynamicsResponse,
} from './types';

const getErrorMessage = (error: any, fallback: string): string => {
  if (error?.code === 'ERR_NETWORK') return 'Cannot connect to backend. Please ensure API server is running on port 5000.';
  if (error?.response?.status === 401) return 'Unauthorized. Please login again.';
  return error?.response?.data?.message || fallback;
};

const createField = async (payload: LeadDynamicsFormValues): Promise<LeadDynamicsMutationResponse> => {
  const response = await api.post('/admin/lead-dynamics', payload);
  return response.data;
};

const updateField = async ({
  id,
  payload,
}: {
  id: string;
  payload: LeadDynamicsFormValues;
}): Promise<LeadDynamicsMutationResponse> => {
  const response = await api.put(`/admin/lead-dynamics/${id}`, payload);
  return response.data;
};

const deleteField = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/lead-dynamics/${id}`);
  return response.data;
};

const patchFields = (
  oldData: ListLeadDynamicsResponse | undefined,
  updater: (list: LeadDynamicField[]) => LeadDynamicField[],
): ListLeadDynamicsResponse | undefined => {
  if (!oldData) return oldData;
  return { ...oldData, data: updater(oldData.data || []) };
};

export const useCreateFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createField,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['lead-dynamics'] });
      const previous = queryClient.getQueriesData<ListLeadDynamicsResponse>({
        queryKey: ['lead-dynamics'],
      });

      queryClient.setQueriesData<ListLeadDynamicsResponse>(
        { queryKey: ['lead-dynamics'] },
        (oldData) =>
          patchFields(oldData, (list) => [
            {
              id: `temp-${Date.now()}`,
              name: payload.name,
              inputType: payload.inputType,
              sortOrder: payload.sortOrder,
              isRequired: payload.isRequired,
              isActive: payload.isActive,
              workspaceId: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              options: payload.options,
            },
            ...list,
          ]),
      );

      return { previous };
    },
    onError: (error: any, _payload, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(getErrorMessage(error, 'Failed to create field'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['lead-dynamics'] });
      toast.success(response?.message || 'Field created successfully');
    },
  });
};

export const useUpdateFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateField,
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['lead-dynamics'] });
      const previous = queryClient.getQueriesData<ListLeadDynamicsResponse>({
        queryKey: ['lead-dynamics'],
      });

      queryClient.setQueriesData<ListLeadDynamicsResponse>(
        { queryKey: ['lead-dynamics'] },
        (oldData) =>
          patchFields(oldData, (list) =>
            list.map((item) =>
              item.id === id
                ? {
                    ...item,
                    ...payload,
                    updatedAt: new Date().toISOString(),
                  }
                : item,
            ),
          ),
      );

      return { previous };
    },
    onError: (error: any, _payload, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(getErrorMessage(error, 'Failed to update field'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['lead-dynamics'] });
      toast.success(response?.message || 'Field updated successfully');
    },
  });
};

export const useDeleteFieldMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteField,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['lead-dynamics'] });
      const previous = queryClient.getQueriesData<ListLeadDynamicsResponse>({
        queryKey: ['lead-dynamics'],
      });

      queryClient.setQueriesData<ListLeadDynamicsResponse>(
        { queryKey: ['lead-dynamics'] },
        (oldData) => patchFields(oldData, (list) => list.filter((item) => item.id !== id)),
      );

      return { previous };
    },
    onError: (error: any, _id, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(getErrorMessage(error, 'Failed to delete field'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['lead-dynamics'] });
      toast.success(response?.message || 'Field deleted successfully');
    },
  });
};
