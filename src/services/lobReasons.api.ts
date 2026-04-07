import api from './api';
import type { LOBReasonListResponse, LOBReasonPayload, LOBReasonStatus } from '../modules/lob-reasons/types/lobReason.types';

export const getLOBReasons = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: LOBReasonStatus | '';
}): Promise<LOBReasonListResponse> => {
  const response = await api.get('/lob-reasons', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      status: params.status || undefined,
    },
  });

  return response.data;
};

export const createLOBReason = async (payload: LOBReasonPayload) => {
  const response = await api.post('/lob-reasons', payload);
  return response.data;
};

export const updateLOBReason = async (id: string, payload: Partial<LOBReasonPayload>) => {
  const response = await api.put(`/lob-reasons/${id}`, payload);
  return response.data;
};

export const toggleLOBReason = async (id: string, status?: LOBReasonStatus) => {
  const response = await api.patch(`/lob-reasons/${id}/status`, status ? { status } : {});
  return response.data;
};

export const deleteLOBReason = async (id: string) => {
  const response = await api.delete(`/lob-reasons/${id}`);
  return response.data;
};
