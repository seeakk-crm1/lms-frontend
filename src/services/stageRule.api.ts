import api from './api';
import {
  CreateStageRuleInput,
  StageRuleFilters,
  UpdateStageRuleInput,
} from '../types/stageRule.types';

export const getStageRules = async (params?: StageRuleFilters & { page?: number; limit?: number }) => {
  const response = await api.get('/master/stage-rules', { params });
  return response.data;
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
