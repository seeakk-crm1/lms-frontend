import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createStageRule, deleteStageRule, updateStageRule } from '../services/stageRule.api';
import {
  CreateStageRuleInput,
  ListStageRulesResponse,
  StageRule,
  UpdateStageRuleInput,
} from '../types/stageRule.types';

const updateStageRuleListCache = (
  oldData: ListStageRulesResponse | undefined,
  updater: (list: StageRule[]) => StageRule[],
): ListStageRulesResponse | undefined => {
  if (!oldData) return oldData;
  return {
    ...oldData,
    data: updater(oldData.data || []),
  };
};

export const useCreateStageRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStageRuleInput) => createStageRule(data),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['stage-rules'] });
      const previous = queryClient.getQueriesData<ListStageRulesResponse>({ queryKey: ['stage-rules'] });

      queryClient.setQueriesData<ListStageRulesResponse>({ queryKey: ['stage-rules'] }, (oldData) =>
        updateStageRuleListCache(oldData, (list) => [
          {
            id: `temp-${Date.now()}`,
            name: payload.name,
            inputType: payload.inputType,
            sortOrder: payload.sortOrder,
            required: payload.required,
            status: payload.status,
            stageId: payload.stageId,
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
      toast.error(error?.response?.data?.message || 'Failed to create stage rule');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stage-rules'] });
      toast.success('Stage rule created successfully');
    },
  });
};

export const useUpdateStageRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStageRuleInput }) => updateStageRule(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['stage-rules'] });
      const previous = queryClient.getQueriesData<ListStageRulesResponse>({ queryKey: ['stage-rules'] });

      queryClient.setQueriesData<ListStageRulesResponse>({ queryKey: ['stage-rules'] }, (oldData) =>
        updateStageRuleListCache(oldData, (list) =>
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
      toast.error(error?.response?.data?.message || 'Failed to update stage rule');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stage-rules'] });
      toast.success('Stage rule updated successfully');
    },
  });
};

export const useDeleteStageRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteStageRule(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['stage-rules'] });
      const previous = queryClient.getQueriesData<ListStageRulesResponse>({ queryKey: ['stage-rules'] });

      queryClient.setQueriesData<ListStageRulesResponse>({ queryKey: ['stage-rules'] }, (oldData) =>
        updateStageRuleListCache(oldData, (list) => list.filter((item) => item.id !== id)),
      );

      return { previous };
    },
    onError: (error: any, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error?.response?.data?.message || 'Failed to delete stage rule');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stage-rules'] });
      toast.success('Stage rule deleted successfully');
    },
  });
};
