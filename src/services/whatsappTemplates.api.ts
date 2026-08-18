import api from './api';
import type {
  CreateWhatsAppTemplatePayload,
  UpdateWhatsAppTemplatePayload,
  WhatsAppTemplate,
} from '../types/whatsappTemplate.types';

export const getWhatsAppTemplates = async (status?: 'ACTIVE' | 'INACTIVE'): Promise<WhatsAppTemplate[]> => {
  const response = await api.get('/whatsapp-templates', {
    params: status ? { status } : undefined,
  });
  return response.data?.data || [];
};

export const getWhatsAppTemplateById = async (id: string): Promise<WhatsAppTemplate> => {
  const response = await api.get(`/whatsapp-templates/${id}`);
  return response.data?.data;
};

export const createWhatsAppTemplate = async (
  payload: CreateWhatsAppTemplatePayload
): Promise<WhatsAppTemplate> => {
  const response = await api.post('/whatsapp-templates', payload);
  return response.data?.data;
};

export const updateWhatsAppTemplate = async (
  id: string,
  payload: UpdateWhatsAppTemplatePayload
): Promise<WhatsAppTemplate> => {
  const response = await api.put(`/whatsapp-templates/${id}`, payload);
  return response.data?.data;
};

export const deleteWhatsAppTemplate = async (id: string): Promise<WhatsAppTemplate> => {
  const response = await api.delete(`/whatsapp-templates/${id}`);
  return response.data?.data;
};

export const recordWhatsAppOpened = async (followUpId: string): Promise<void> => {
  await api.post('/whatsapp-templates/record-opened', { followUpId });
};
