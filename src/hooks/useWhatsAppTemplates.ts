import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWhatsAppTemplate,
  deleteWhatsAppTemplate,
  getWhatsAppTemplates,
  recordWhatsAppOpened,
  updateWhatsAppTemplate,
} from '../services/whatsappTemplates.api';
import type {
  CreateWhatsAppTemplatePayload,
  UpdateWhatsAppTemplatePayload,
  WhatsAppTemplateStatus,
} from '../types/whatsappTemplate.types';
import toast from 'react-hot-toast';

export const WHATSAPP_TEMPLATES_QUERY_KEY = ['whatsapp-templates'];

export const useWhatsAppTemplatesQuery = (status?: WhatsAppTemplateStatus, enabled = true) => {
  return useQuery({
    queryKey: status ? [...WHATSAPP_TEMPLATES_QUERY_KEY, status] : WHATSAPP_TEMPLATES_QUERY_KEY,
    queryFn: () => getWhatsAppTemplates(status),
    enabled,
  });
};

export const useCreateWhatsAppTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateWhatsAppTemplatePayload) => createWhatsAppTemplate(payload),
    onSuccess: () => {
      toast.success('WhatsApp template created successfully!');
      void queryClient.invalidateQueries({ queryKey: WHATSAPP_TEMPLATES_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create WhatsApp template.';
      toast.error(msg);
    },
  });
};

export const useUpdateWhatsAppTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWhatsAppTemplatePayload }) =>
      updateWhatsAppTemplate(id, payload),
    onSuccess: () => {
      toast.success('WhatsApp template updated successfully!');
      void queryClient.invalidateQueries({ queryKey: WHATSAPP_TEMPLATES_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update WhatsApp template.';
      toast.error(msg);
    },
  });
};

export const useDeleteWhatsAppTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWhatsAppTemplate(id),
    onSuccess: (data) => {
      if (data?.status === 'INACTIVE') {
        toast('Template is linked to existing follow-ups so it was set to Inactive.', { icon: 'ℹ️' });
      } else {
        toast.success('WhatsApp template deleted.');
      }
      void queryClient.invalidateQueries({ queryKey: WHATSAPP_TEMPLATES_QUERY_KEY });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete template.';
      toast.error(msg);
    },
  });
};

export const useRecordWhatsAppOpenedMutation = () => {
  return useMutation({
    mutationFn: (
      payload: string | { followUpId?: string; leadId?: string; mode?: 'TEMPLATE' | 'DIRECT'; templateName?: string; source?: string }
    ) => recordWhatsAppOpened(payload),
    onError: (error: any) => {
      console.warn('Failed to log WhatsApp opening activity:', error);
    },
  });
};
