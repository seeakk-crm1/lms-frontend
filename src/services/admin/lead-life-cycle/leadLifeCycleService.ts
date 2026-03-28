import api from '../../api';
import type {
  LeadLifeCycleFormValues,
  LeadLifeCycleMutationResponse,
  ListLeadLifeCyclesResponse,
  LeadStageOption,
} from '../../../types/admin/lead-life-cycle/leadLifeCycle.types';

interface GetLifeCyclesParams {
  page: number;
  limit: number;
  search?: string;
}

interface StageListApiResponse {
  success: boolean;
  data:
    | Array<{ id: string; name: string; status?: string; color?: string; order?: number }>
    | { data?: Array<{ id: string; name: string; status?: string; color?: string; order?: number }> };
}

export const getLifeCycles = async (params: GetLifeCyclesParams): Promise<ListLeadLifeCyclesResponse> => {
  const response = await api.get('/admin/lead-life-cycles', { params });
  return response.data;
};

export const createLifeCycle = async (
  payload: LeadLifeCycleFormValues,
): Promise<LeadLifeCycleMutationResponse> => {
  const response = await api.post('/admin/lead-life-cycles', payload);
  return response.data;
};

export const updateLifeCycle = async (
  id: string,
  payload: LeadLifeCycleFormValues,
): Promise<LeadLifeCycleMutationResponse> => {
  const response = await api.put(`/admin/lead-life-cycles/${id}`, payload);
  return response.data;
};

export const deleteLifeCycle = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/lead-life-cycles/${id}`);
  return response.data;
};

export const getLeadStages = async (): Promise<LeadStageOption[]> => {
  const endpoints = [
    '/master/lead-stages',
    '/admin/lead-life-cycles/stage-options',
    '/admin/lead-stages',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await api.get<StageListApiResponse>(endpoint, {
        params: { page: 1, limit: 500, status: 'ACTIVE' },
      });
      const raw = response.data?.data;
      const rows = Array.isArray(raw) ? raw : raw?.data || [];
      return rows
        .filter((item) => !item.status || item.status === 'ACTIVE')
        .sort((left, right) => {
          const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
          const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
          if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
          }
          return left.name.localeCompare(right.name);
        })
        .map((item) => ({ id: item.id, name: item.name }));
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) throw error;
      if (endpoint === endpoints[endpoints.length - 1]) throw error;
    }
  }

  return [];
};
