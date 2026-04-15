import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLeadSource, deleteLeadSource, toggleLeadSourceStatus, updateLeadSource } from '../services/leadSource.api';
import {
  CreateLeadSourceInput,
  LeadSource,
  ListLeadSourcesResponse,
  UpdateLeadSourceInput,
} from '../types/leadSource.types';
import { toast } from 'react-hot-toast';

const updateLeadSourceListCache = (
  oldData: ListLeadSourcesResponse | undefined,
  updater: (list: LeadSource[]) => LeadSource[],
): ListLeadSourcesResponse | undefined => {
  if (!oldData) return oldData;
  return {
    ...oldData,
    data: updater(oldData.data || []),
  };
};

const isTempLeadSourceId = (id: string): boolean => id.startsWith('temp-');

export const useCreateLeadSourceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadSourceInput) => createLeadSource(data),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['lead-sources'] });
      const previous = queryClient.getQueriesData<ListLeadSourcesResponse>({ queryKey: ['lead-sources'] });

      queryClient.setQueriesData<ListLeadSourcesResponse>({ queryKey: ['lead-sources'] }, (oldData) =>
        updateLeadSourceListCache(oldData, (list) => [
          {
            id: `temp-${Date.now()}`,
            name: payload.name,
            status: payload.status,
            createdBy: 'You',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          ...list,
        ]),
      );

      return { previous };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error?.response?.data?.message || 'Failed to create lead source');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
      queryClient.invalidateQueries({ queryKey: ['lead-meta'] });
      toast.success('Lead source created successfully');
    },
  });
};

export const useUpdateLeadSourceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadSourceInput }) => {
      if (isTempLeadSourceId(id)) {
        throw new Error('Please wait for the lead source to finish saving before editing it.');
      }
      return updateLeadSource(id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['lead-sources'] });
      const previous = queryClient.getQueriesData<ListLeadSourcesResponse>({ queryKey: ['lead-sources'] });

      queryClient.setQueriesData<ListLeadSourcesResponse>({ queryKey: ['lead-sources'] }, (oldData) =>
        updateLeadSourceListCache(oldData, (list) =>
          list.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...data,
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        ),
      );

      return { previous };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error?.response?.data?.message || 'Failed to update lead source');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
      queryClient.invalidateQueries({ queryKey: ['lead-meta'] });
      toast.success('Lead source updated successfully');
    },
  });
};

export const useToggleLeadSourceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (isTempLeadSourceId(id)) {
        throw new Error('Please wait for the lead source to finish saving before changing its status.');
      }
      return toggleLeadSourceStatus(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['lead-sources'] });
      const previous = queryClient.getQueriesData<ListLeadSourcesResponse>({ queryKey: ['lead-sources'] });

      queryClient.setQueriesData<ListLeadSourcesResponse>({ queryKey: ['lead-sources'] }, (oldData) =>
        updateLeadSourceListCache(oldData, (list) =>
          list.map((item) =>
            item.id === id
              ? { ...item, status: item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE', updatedAt: new Date().toISOString() }
              : item,
          ),
        ),
      );

      return { previous };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error?.response?.data?.message || 'Failed to update lead source status');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
      queryClient.invalidateQueries({ queryKey: ['lead-meta'] });
      toast.success('Lead source status updated');
    },
  });
};

export const useDeleteLeadSourceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (isTempLeadSourceId(id)) {
        throw new Error('Please wait for the lead source to finish saving before deleting it.');
      }
      return deleteLeadSource(id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['lead-sources'] });
      const previous = queryClient.getQueriesData<ListLeadSourcesResponse>({ queryKey: ['lead-sources'] });

      queryClient.setQueriesData<ListLeadSourcesResponse>({ queryKey: ['lead-sources'] }, (oldData) => {
        if (!oldData) return oldData;

        const nextData = oldData.data.filter((item) => item.id !== id);
        return {
          ...oldData,
          data: nextData,
          pagination: {
            ...oldData.pagination,
            total: Math.max(0, oldData.pagination.total - (oldData.data.length - nextData.length)),
          },
        };
      });

      return { previous };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error?.response?.data?.message || 'Failed to delete lead source');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-sources'] });
      queryClient.invalidateQueries({ queryKey: ['lead-meta'] });
      toast.success('Lead source deleted successfully');
    },
  });
};
