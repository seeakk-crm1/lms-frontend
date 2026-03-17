import api from './api';
import { CreateLeadStageInput, LeadStageFilters, UpdateLeadStageInput } from '../types/leadStage.types';

export const getLeadStages = async (params?: LeadStageFilters & { page?: number; limit?: number }) => {
  const response = await api.get('/master/lead-stages', { params });
  return response.data;
};

export const createLeadStage = async (data: CreateLeadStageInput) => {
  const response = await api.post('/master/lead-stages', data);
  return response.data.data;
};

export const updateLeadStage = async (id: string, data: UpdateLeadStageInput) => {
  const response = await api.put(`/master/lead-stages/${id}`, data);
  return response.data.data;
};

export const deleteLeadStage = async (id: string) => {
  const response = await api.delete(`/master/lead-stages/${id}`);
  return response.data;
};

