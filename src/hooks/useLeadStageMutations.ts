import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createLeadStage, deleteLeadStage, updateLeadStage } from '../services/leadStage.api';
import { CreateLeadStageInput, LeadStage, ListLeadStagesResponse, UpdateLeadStageInput } from '../types/leadStage.types';
import {
  invalidateLeadStageConsumers,
  notifyLeadStageConsumersUpdated,
  syncLeadStageAcrossCaches,
  toStageColorPatch,
} from '../utils/syncLeadStageColor';

const updateLeadStageListCache = (
  oldData: ListLeadStagesResponse | undefined,
  updater: (list: LeadStage[]) => LeadStage[],
): ListLeadStagesResponse | undefined => {
  if (!oldData) return oldData;
  return { ...oldData, data: updater(oldData.data || []) };
};

const refreshLeadStageConsumers = (queryClient: ReturnType<typeof useQueryClient>, stage?: LeadStage) => {
  if (stage) {
    const patch = toStageColorPatch(stage);
    syncLeadStageAcrossCaches(queryClient, patch);
    notifyLeadStageConsumersUpdated(patch);
  }

  invalidateLeadStageConsumers(queryClient);
};

export const useCreateLeadStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadStageInput) => createLeadStage(data),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['lead-stages'] });
      const previous = queryClient.getQueriesData<ListLeadStagesResponse>({ queryKey: ['lead-stages'] });

      queryClient.setQueriesData<ListLeadStagesResponse>({ queryKey: ['lead-stages'] }, (oldData) =>
        updateLeadStageListCache(oldData, (list) => [
          {
            id: `temp-${Date.now()}`,
            name: payload.name,
            stageShortForm: payload.stageShortForm ?? null,
            showInCalendar: payload.showInCalendar ?? true,
            color: payload.color,
            isApprovalRequired: payload.isApprovalRequired,
            isLOB: payload.isLOB,
            isClosed: payload.isClosed,
            stageOrder: payload.stageOrder,
            rules: [],
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
        context.previous.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      }
      toast.error(error?.response?.data?.message || 'Failed to create lead stage');
    },
    onSuccess: (createdStage) => {
      queryClient.setQueriesData<ListLeadStagesResponse>({ queryKey: ['lead-stages'] }, (oldData) =>
        updateLeadStageListCache(oldData, (list) => {
          const withoutTemp = list.filter((item) => !item.id.startsWith('temp-'));
          const exists = withoutTemp.some((item) => item.id === createdStage.id);
          return exists
            ? withoutTemp.map((item) => (item.id === createdStage.id ? createdStage : item))
            : [createdStage, ...withoutTemp];
        }),
      );
      void queryClient.invalidateQueries({ queryKey: ['lead-stages'] });
      refreshLeadStageConsumers(queryClient, createdStage);
      toast.success('Stage created successfully');
    },
  });
};

export const useUpdateLeadStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadStageInput }) => updateLeadStage(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['lead-stages'] });
      const previousLeadStages = queryClient.getQueriesData<ListLeadStagesResponse>({ queryKey: ['lead-stages'] });

      queryClient.setQueriesData<ListLeadStagesResponse>({ queryKey: ['lead-stages'] }, (oldData) =>
        updateLeadStageListCache(oldData, (list) =>
          list.map((item) => {
            if (item.id !== id) return item;
            const { substages, ...restData } = data;
            const updatedSubstages = Array.isArray(substages) ? substages : item.substages;
            return {
              ...item,
              ...restData,
              substages: updatedSubstages,
              updatedAt: new Date().toISOString(),
            };
          }),
        ),
      );

      if (
        data.color ||
        data.name ||
        data.stageShortForm !== undefined ||
        data.showInCalendar !== undefined ||
        data.isLOB !== undefined ||
        data.isClosed !== undefined
      ) {
        syncLeadStageAcrossCaches(queryClient, { id, ...data });
      }

      return { previousLeadStages };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousLeadStages) {
        context.previousLeadStages.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      }
      toast.error(error?.response?.data?.message || 'Failed to update lead stage');
    },
    onSuccess: (updatedStage) => {
      queryClient.setQueriesData<ListLeadStagesResponse>({ queryKey: ['lead-stages'] }, (oldData) =>
        updateLeadStageListCache(oldData, (list) =>
          list.map((item) => (item.id === updatedStage.id ? updatedStage : item)),
        ),
      );
      void queryClient.invalidateQueries({ queryKey: ['lead-stages'] });
      refreshLeadStageConsumers(queryClient, updatedStage);
      toast.success('Stage updated');
    },
  });
};

export const useDeleteLeadStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLeadStage(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['lead-stages'] });
      const previous = queryClient.getQueriesData<ListLeadStagesResponse>({ queryKey: ['lead-stages'] });

      queryClient.setQueriesData<ListLeadStagesResponse>({ queryKey: ['lead-stages'] }, (oldData) =>
        updateLeadStageListCache(oldData, (list) => list.filter((item) => item.id !== id)),
      );

      return { previous };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      }
      toast.error(error?.response?.data?.message || 'Failed to delete lead stage');
    },
    onSuccess: () => {
      invalidateLeadStageConsumers(queryClient);
      notifyLeadStageConsumersUpdated();
      toast.success('Stage deleted');
    },
  });
};
