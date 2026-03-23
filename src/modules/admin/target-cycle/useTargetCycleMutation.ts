import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import type {
  ListTargetCyclesResponse,
  TargetCycle,
  TargetCycleFormValues,
  TargetCycleMutationResponse,
} from './types';

const shouldFallback = (error: any): boolean => error?.response?.status === 404;

const createTargetCycle = async (payload: TargetCycleFormValues): Promise<TargetCycleMutationResponse> => {
  try {
    const response = await api.post('/admin/target-cycles', payload);
    return response.data;
  } catch (error: any) {
    if (!shouldFallback(error)) throw error;
    const fallbackResponse = await api.post('/master/target-cycles', payload);
    return fallbackResponse.data;
  }
};

const updateTargetCycle = async ({
  id,
  payload,
}: {
  id: string;
  payload: TargetCycleFormValues;
}): Promise<TargetCycleMutationResponse> => {
  try {
    const response = await api.put(`/admin/target-cycles/${id}`, payload);
    return response.data;
  } catch (error: any) {
    if (!shouldFallback(error)) throw error;
    const fallbackResponse = await api.put(`/master/target-cycles/${id}`, payload);
    return fallbackResponse.data;
  }
};

const deleteTargetCycle = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/admin/target-cycles/${id}`);
    return response.data;
  } catch (error: any) {
    if (!shouldFallback(error)) throw error;
    const fallbackResponse = await api.delete(`/master/target-cycles/${id}`);
    return fallbackResponse.data;
  }
};

const patchTargetCycleList = (
  oldData: ListTargetCyclesResponse | undefined,
  updater: (list: TargetCycle[]) => TargetCycle[],
): ListTargetCyclesResponse | undefined => {
  if (!oldData) return oldData;
  return {
    ...oldData,
    data: updater(oldData.data || []),
  };
};

export const useCreateTargetCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTargetCycle,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['target-cycles'] });
      const previous = queryClient.getQueriesData<ListTargetCyclesResponse>({ queryKey: ['target-cycles'] });

      queryClient.setQueriesData<ListTargetCyclesResponse>({ queryKey: ['target-cycles'] }, (oldData) =>
        patchTargetCycleList(oldData, (list) => [
          {
            id: `temp-${Date.now()}`,
            name: payload.name,
            workspaceId: '',
            totalDays: payload.ranges.reduce((sum, item) => sum + (item.endDay - item.startDay + 1), 0),
            status: payload.status,
            createdBy: 'You',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ranges: payload.ranges,
          },
          ...list,
        ]),
      );

      return { previous };
    },
    onError: (error: any, _payload, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(error?.response?.data?.message || 'Failed to create target cycle');
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['target-cycles'] });
      toast.success(response?.message || 'Target cycle created successfully');
    },
  });
};

export const useUpdateTargetCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTargetCycle,
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['target-cycles'] });
      const previous = queryClient.getQueriesData<ListTargetCyclesResponse>({ queryKey: ['target-cycles'] });

      queryClient.setQueriesData<ListTargetCyclesResponse>({ queryKey: ['target-cycles'] }, (oldData) =>
        patchTargetCycleList(oldData, (list) =>
          list.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...payload,
                  totalDays: payload.ranges.reduce((sum, row) => sum + (row.endDay - row.startDay + 1), 0),
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
      toast.error(error?.response?.data?.message || 'Failed to update target cycle');
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['target-cycles'] });
      toast.success(response?.message || 'Target cycle updated successfully');
    },
  });
};

export const useDeleteTargetCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTargetCycle,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['target-cycles'] });
      const previous = queryClient.getQueriesData<ListTargetCyclesResponse>({ queryKey: ['target-cycles'] });

      queryClient.setQueriesData<ListTargetCyclesResponse>({ queryKey: ['target-cycles'] }, (oldData) =>
        patchTargetCycleList(oldData, (list) => list.filter((item) => item.id !== id)),
      );

      return { previous };
    },
    onError: (error: any, _id, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(error?.response?.data?.message || 'Failed to delete target cycle');
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['target-cycles'] });
      toast.success(response?.message || 'Target cycle deleted successfully');
    },
  });
};
