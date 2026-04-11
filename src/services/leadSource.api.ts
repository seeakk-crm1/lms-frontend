import api from './api';
import {
  CreateLeadSourceInput,
  LeadSourceFilters,
  UpdateLeadSourceInput,
} from '../types/leadSource.types';

export const getLeadSources = async (params?: LeadSourceFilters & { page?: number; limit?: number }) => {
  const response = await api.get('/master/lead-sources', { params });
  return response.data;
};

export const createLeadSource = async (data: CreateLeadSourceInput) => {
  const response = await api.post('/master/lead-sources', data);
  return response.data.data;
};

export const updateLeadSource = async (id: string, data: UpdateLeadSourceInput) => {
  const response = await api.put(`/master/lead-sources/${id}`, data);
  return response.data.data;
};

export const toggleLeadSourceStatus = async (id: string) => {
  const response = await api.patch(`/master/lead-sources/${id}/status`);
  return response.data.data;
};

export const deleteLeadSource = async (id: string) => {
  const response = await api.delete(`/master/lead-sources/${id}`);
  return response.data;
};
