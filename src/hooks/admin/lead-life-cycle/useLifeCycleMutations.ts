import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  createLifeCycle,
  deleteLifeCycle,
  updateLifeCycle,
} from '../../../services/admin/lead-life-cycle/leadLifeCycleService';
import type {
  LeadLifeCycle,
  LeadLifeCycleFormValues,
  ListLeadLifeCyclesResponse,
} from '../../../types/admin/lead-life-cycle/leadLifeCycle.types';

const getErrorMessage = (error: any, fallback: string): string => {
  if (error?.code === 'ERR_NETWORK') return 'Cannot connect to backend. Please ensure API server is running.';
  if (error?.response?.status === 401) return 'Unauthorized. Please login again.';
  return error?.response?.data?.message || fallback;
};

const patchList = (
  oldData: ListLeadLifeCyclesResponse | undefined,
  updater: (list: LeadLifeCycle[]) => LeadLifeCycle[],
): ListLeadLifeCyclesResponse | undefined => {
  if (!oldData) return oldData;

  return {
    ...oldData,
    data: {
      ...oldData.data,
      lifeCycles: updater(oldData.data?.lifeCycles || []),
    },
  };
};

const withAutoSort = (payload: LeadLifeCycleFormValues): LeadLifeCycleFormValues => ({
  ...payload,
  transitions: payload.transitions.map((transition, index) => ({
    ...transition,
    sortOrder: transition.sortOrder ?? index + 1,
  })),
});

export const useCreateLifeCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LeadLifeCycleFormValues) => createLifeCycle(withAutoSort(payload)),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['lead-life-cycles'] });
      const previous = queryClient.getQueriesData<ListLeadLifeCyclesResponse>({ queryKey: ['lead-life-cycles'] });

      queryClient.setQueriesData<ListLeadLifeCyclesResponse>({ queryKey: ['lead-life-cycles'] }, (oldData) =>
        patchList(oldData, (list) => [
          {
            id: `temp-${Date.now()}`,
            name: payload.name,
            isDefault: payload.isDefault,
            workspaceId: '',
            createdBy: 'You',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            transitions: payload.transitions.map((transition, index) => ({
              id: `temp-row-${index}`,
              fromStageId: transition.fromStageId,
              toStageId: transition.toStageId,
              numberOfDays: transition.numberOfDays,
              sortOrder: transition.sortOrder ?? index + 1,
            })),
          },
          ...list,
        ]),
      );

      return { previous };
    },
    onError: (error: any, _payload, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(getErrorMessage(error, 'Failed to create life cycle'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['lead-life-cycles'] });
      toast.success(response?.message || 'Lead life cycle created successfully');
    },
  });
};

export const useUpdateLifeCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LeadLifeCycleFormValues }) =>
      updateLifeCycle(id, withAutoSort(payload)),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['lead-life-cycles'] });
      const previous = queryClient.getQueriesData<ListLeadLifeCyclesResponse>({ queryKey: ['lead-life-cycles'] });

      queryClient.setQueriesData<ListLeadLifeCyclesResponse>({ queryKey: ['lead-life-cycles'] }, (oldData) =>
        patchList(oldData, (list) =>
          list.map((item) =>
            item.id === id
              ? {
                  ...item,
                  name: payload.name,
                  isDefault: payload.isDefault,
                  transitions: payload.transitions.map((transition, index) => ({
                    id: `temp-row-${index}`,
                    fromStageId: transition.fromStageId,
                    toStageId: transition.toStageId,
                    numberOfDays: transition.numberOfDays,
                    sortOrder: transition.sortOrder ?? index + 1,
                  })),
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
      toast.error(getErrorMessage(error, 'Failed to update life cycle'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['lead-life-cycles'] });
      toast.success(response?.message || 'Lead life cycle updated successfully');
    },
  });
};

export const useDeleteLifeCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLifeCycle(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['lead-life-cycles'] });
      const previous = queryClient.getQueriesData<ListLeadLifeCyclesResponse>({ queryKey: ['lead-life-cycles'] });

      queryClient.setQueriesData<ListLeadLifeCyclesResponse>({ queryKey: ['lead-life-cycles'] }, (oldData) =>
        patchList(oldData, (list) => list.filter((item) => item.id !== id)),
      );

      return { previous };
    },
    onError: (error: any, _id, context) => {
      context?.previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      toast.error(getErrorMessage(error, 'Failed to delete life cycle'));
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['lead-life-cycles'] });
      toast.success(response?.message || 'Lead life cycle deleted successfully');
    },
  });
};
