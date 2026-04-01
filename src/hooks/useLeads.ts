import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useLeadStore from '../store/leadStore';
import {
  changeLeadStage,
  createLead,
  deleteLead,
  exportLeads,
  getActiveLeadDynamicFields,
  getLeadById,
  getLeadMeta,
  getLeads,
  saveLeadDynamicValues,
  updateLead,
} from '../services/leads.api';
import type {
  LeadCreatePayload,
  LeadDynamicValuePayload,
  LeadMutationResponse,
  LeadUpdatePayload,
  ListLeadsResponse,
} from '../types/lead.types';

type LeadMutationInput = {
  id?: string;
  payload: LeadCreatePayload | LeadUpdatePayload;
  dynamicValues?: LeadDynamicValuePayload[];
};

const toDynamicPayload = (values?: LeadDynamicValuePayload[]) =>
  values?.filter((item) => item.value.trim().length > 0) || [];

export const useLeadsQuery = () => {
  const { filters, search, pagination } = useLeadStore();

  return useQuery<ListLeadsResponse, Error>({
    queryKey: ['leads', search, filters, pagination.page, pagination.limit],
    queryFn: () =>
      getLeads({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        stage: filters.stage || undefined,
        assignedTo: filters.assignedTo || undefined,
        source: filters.source || undefined,
        status: filters.status || undefined,
        createdFrom: filters.createdFrom || undefined,
        createdTo: filters.createdTo || undefined,
      }),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 429) return false;
      return failureCount < 2;
    },
  });
};

export const useLeadDetailQuery = (leadId?: string, enabled = true) =>
  useQuery<LeadMutationResponse['data'], Error>({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const response = await getLeadById(leadId as string);
      return response.data;
    },
    enabled: Boolean(leadId && enabled),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
  });

export const useLeadMetaQuery = () =>
  useQuery({
    queryKey: ['lead-meta'],
    queryFn: getLeadMeta,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

export const useDynamicFieldsQuery = () =>
  useQuery({
    queryKey: ['lead-dynamics', 'active'],
    queryFn: getActiveLeadDynamicFields,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

export const useCreateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload, dynamicValues }: LeadMutationInput) => {
      const response = await createLead(payload as LeadCreatePayload);
      const lead = response.data;
      const dynamicPayload = toDynamicPayload(dynamicValues);

      if (dynamicPayload.length > 0) {
        await saveLeadDynamicValues(lead.id, dynamicPayload);
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create lead');
    },
  });
};

export const useUpdateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload, dynamicValues }: LeadMutationInput) => {
      const response = await updateLead(id as string, payload as LeadUpdatePayload);
      const dynamicPayload = toDynamicPayload(dynamicValues);

      if (dynamicPayload.length > 0) {
        await saveLeadDynamicValues(id as string, dynamicPayload);
      }

      return response;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update lead');
    },
  });
};

export const useChangeLeadStageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof changeLeadStage>[1];
    }) => changeLeadStage(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Lead stage updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update lead stage');
    },
  });
};

export const useDeleteLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead archived successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to archive lead');
    },
  });
};

export const useExportLeads = () =>
  useMutation({
    mutationFn: async (params: Record<string, unknown>) => {
      const response = await exportLeads({ ...params, format: 'csv' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute('download', `seeakk-leads-${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    },
    onSuccess: () => {
      toast.success('Lead export downloaded');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to export leads');
    },
  });
