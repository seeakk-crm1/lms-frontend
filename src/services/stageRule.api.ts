import api from './api';
import {
  CreateStageRuleInput,
  StageRuleFilters,
  UpdateStageRuleInput,
} from '../types/stageRule.types';

export const getStageRules = async (params?: StageRuleFilters & { page?: number; limit?: number }) => {
  const response = await api.get('/master/stage-rules', {
    params: {
      search: params?.search,
      status: params?.status,
      stageId: params?.stageId,
      page: params?.page,
      limit: params?.limit,
    },
  });
  return response.data;
};

export const getLeadTransitionStageRules = async (stageId: string) => {
  try {
    const response = await api.get('/leads/meta/stage-rules', {
      params: { stageId },
    });
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    if (status !== 404 && status !== 405) {
      throw error;
    }

    const fallbackResponse = await api.get('/master/stage-rules', {
      params: {
        search: '',
        status: 'ACTIVE',
        stageId,
        page: 1,
        limit: 100,
      },
    });
    return fallbackResponse.data;
  }
};

export const createStageRule = async (data: CreateStageRuleInput) => {
  const response = await api.post('/master/stage-rules', data);
  return response.data.data;
};

export const updateStageRule = async (id: string, data: UpdateStageRuleInput) => {
  const response = await api.put(`/master/stage-rules/${id}`, data);
  return response.data.data;
};

export const deleteStageRule = async (id: string) => {
  const response = await api.delete(`/master/stage-rules/${id}`);
  return response.data;
};
