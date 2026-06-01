import api from './api';
import type {
  ActiveExtensionReasonOption,
  ExtensionReasonListResponse,
  ExtensionReasonPayload,
} from '../modules/followup-extension-reasons/types/followUpExtensionReason.types';

export const getExtensionReasons = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}): Promise<ExtensionReasonListResponse> => {
  const response = await api.get('/followup-extension-reasons', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      search: params.search || undefined,
      isActive: params.isActive !== undefined ? String(params.isActive) : undefined,
    },
  });

  return response.data;
};

export const createExtensionReason = async (payload: ExtensionReasonPayload) => {
  const response = await api.post('/followup-extension-reasons', payload);
  return response.data;
};

export const getActiveExtensionReasons = async (): Promise<{ success: boolean; data: ActiveExtensionReasonOption[] }> => {
  const response = await api.get('/followup-extension-reasons/active');
  return response.data;
};

export const updateExtensionReason = async (id: string, payload: Partial<ExtensionReasonPayload>) => {
  const response = await api.put(`/followup-extension-reasons/${id}`, payload);
  return response.data;
};

export const toggleExtensionReason = async (id: string, isActive: boolean) => {
  const response = await api.patch(`/followup-extension-reasons/${id}/status`, { isActive });
  return response.data;
};

export const deleteExtensionReason = async (id: string) => {
  const response = await api.delete(`/followup-extension-reasons/${id}`);
  return response.data;
};
