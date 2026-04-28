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

export const getActiveLeadSources = async () => {
  const endpoints = [
    '/master/lead-sources/active',
    '/master/lead-sources',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint, {
        params: endpoint.endsWith('/active') ? undefined : { page: 1, limit: 500, status: 'ACTIVE' },
      });
      const payload = response.data;
      if (endpoint.endsWith('/active')) {
        return payload;
      }

      const rows = Array.isArray(payload?.data) ? payload.data : [];
      return {
        success: payload?.success ?? true,
        data: rows.filter((item: any) => !item?.status || item.status === 'ACTIVE'),
      };
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) throw error;
      if (endpoint === endpoints[endpoints.length - 1]) throw error;
    }
  }

  return { success: true, data: [] };
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
