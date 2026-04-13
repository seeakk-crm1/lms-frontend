import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useLeadStore from '../store/leadStore';
import useAuthStore from '../store/useAuthStore';
import {
  changeLeadStage,
  createLead,
  deleteLead,
  extendLeadSla,
  exportLeads,
  getActiveLeadDynamicFields,
  getLeadById,
  getLeadMeta,
  getLeads,
  permanentlyDeleteLead,
  bulkDeleteLeads,
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

const patchLeadInListResponse = (
  previous: ListLeadsResponse | undefined,
  nextLead: LeadMutationResponse['data'],
): ListLeadsResponse | undefined => {
  if (!previous) return previous;

  const leadExists = previous.leads.some((lead) => lead.id === nextLead.id);
  if (!leadExists) return previous;

  return {
    ...previous,
    leads: previous.leads.map((lead) => (lead.id === nextLead.id ? nextLead : lead)),
  };
};

const insertLeadIntoListResponse = (
  previous: ListLeadsResponse | undefined,
  nextLead: LeadMutationResponse['data'],
): ListLeadsResponse | undefined => {
  if (!previous) return previous;
  if (previous.leads.some((lead) => lead.id === nextLead.id)) {
    return patchLeadInListResponse(previous, nextLead);
  }

  const nextLeads = [nextLead, ...previous.leads];
  const trimmedLeads = nextLeads.slice(0, previous.pagination.limit);

  return {
    ...previous,
    leads: trimmedLeads,
    pagination: {
      ...previous.pagination,
      total: previous.pagination.total + 1,
      totalPages: Math.max(1, Math.ceil((previous.pagination.total + 1) / previous.pagination.limit)),
      hasNext: previous.pagination.total + 1 > previous.pagination.limit ? true : previous.pagination.hasNext,
    },
  };
};

const queryLooksUnfiltered = (queryKey: readonly unknown[]) => {
  const [, search, filters, page] = queryKey;

  if (search) return false;
  if (page !== 1) return false;
  if (!filters || typeof filters !== 'object' || Array.isArray(filters)) return true;

  return Object.values(filters).every((value) => value === undefined || value === '');
};

const removeLeadFromListResponse = (
  previous: ListLeadsResponse | undefined,
  leadId: string,
): ListLeadsResponse | undefined => {
  if (!previous) return previous;

  const nextLeads = previous.leads.filter((lead) => lead.id !== leadId);
  if (nextLeads.length === previous.leads.length) return previous;

  return {
    ...previous,
    leads: nextLeads,
    pagination: {
      ...previous.pagination,
      total: Math.max(0, previous.pagination.total - 1),
    },
  };
};

export const useLeadsQuery = () => {
  const { filters, search, pagination } = useLeadStore();

  return useQuery<ListLeadsResponse, Error>({
    queryKey: ['leads', search, filters, pagination.page, pagination.limit],
    queryFn: ({ signal }) =>
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
      }, signal),
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
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });

export const useLeadMetaQuery = (enabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['lead-meta'],
    queryFn: getLeadMeta,
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
};

export const useDynamicFieldsQuery = (enabled = true) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['lead-dynamics', 'active'],
    queryFn: getActiveLeadDynamicFields,
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
};

export const useCreateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payload, dynamicValues }: LeadMutationInput) => {
      const response = await createLead(payload as LeadCreatePayload);
      const lead = response.data;
      const dynamicPayload = toDynamicPayload(dynamicValues);
      let dynamicValuesSaved = true;

      if (dynamicPayload.length > 0) {
        try {
          await saveLeadDynamicValues(lead.id, dynamicPayload);
        } catch (error) {
          dynamicValuesSaved = false;
          console.error('Lead created but dynamic values failed to save', error);
        }
      }

      return {
        ...response,
        dynamicValuesSaved,
      };
    },
    onSuccess: (response) => {
      queryClient
        .getQueriesData<ListLeadsResponse>({ queryKey: ['leads'] })
        .forEach(([queryKey]) => {
          if (!Array.isArray(queryKey) || !queryLooksUnfiltered(queryKey)) return;
          queryClient.setQueryData<ListLeadsResponse>(queryKey, (previous) =>
            insertLeadIntoListResponse(previous, response.data),
          );
        });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      if (response.dynamicValuesSaved === false) {
        toast.success('Lead created successfully. Advanced fields can be updated again if needed.');
        return;
      }
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 409) {
        toast.error(message || 'A lead with the same contact details already exists.');
        return;
      }
      toast.error(message || 'Failed to create lead');
    },
  });
};

export const useUpdateLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload, dynamicValues }: LeadMutationInput) => {
      const response = await updateLead(id as string, payload as LeadUpdatePayload);
      const dynamicPayload = toDynamicPayload(dynamicValues);
      let dynamicValuesSaved = true;

      if (dynamicPayload.length > 0) {
        try {
          await saveLeadDynamicValues(id as string, dynamicPayload);
        } catch (error) {
          dynamicValuesSaved = false;
          console.error('Lead updated but dynamic values failed to save', error);
        }
      }

      return {
        ...response,
        dynamicValuesSaved,
      };
    },
    onSuccess: (response, variables) => {
      queryClient.setQueriesData<ListLeadsResponse>({ queryKey: ['leads'] }, (previous) =>
        patchLeadInListResponse(previous, response.data),
      );
      queryClient.setQueryData(['lead', variables.id], response.data);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      if (response.dynamicValuesSaved === false) {
        toast.success('Lead updated successfully. Advanced fields can be updated again if needed.');
        return;
      }
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 409) {
        toast.error(message || 'Request could not be completed due to a conflicting lead update.');
        return;
      }
      toast.error(message || 'Failed to update lead');
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
      const nextLead = _data?.approvalRequired ? _data?.data?.lead : _data?.data;

      if (nextLead?.id) {
        queryClient.setQueriesData<ListLeadsResponse>({ queryKey: ['leads'] }, (previous) =>
          patchLeadInListResponse(previous, nextLead),
        );
        queryClient.setQueryData(['lead', variables.id], nextLead);
      }
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['lead-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['closed-leads'] });

      if (_data?.approvalRequired) {
        toast.success(_data?.message || 'Approval request created successfully');
        return;
      }

      toast.success(_data?.message || 'Lead stage updated');
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        queryClient.invalidateQueries({ queryKey: ['lead-approvals'] });
      }
      toast.error(error?.response?.data?.message || 'Failed to update lead stage');
    },
  });
};

export const useDeleteLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: (_response, leadId) => {
      queryClient.setQueriesData<ListLeadsResponse>({ queryKey: ['leads'] }, (previous) =>
        removeLeadFromListResponse(previous, leadId),
      );
      queryClient.removeQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead archived successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to archive lead');
    },
  });
};

export const usePermanentDeleteLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permanentlyDeleteLead(id),
    onSuccess: (_response, leadId) => {
      queryClient.setQueriesData<ListLeadsResponse>({ queryKey: ['leads'] }, (previous) =>
        removeLeadFromListResponse(previous, leadId),
      );
      queryClient.removeQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      toast.success('Lead permanently deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to permanently delete lead');
    },
  });
};

export const useBulkDeleteLeadsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, permanent }: { ids: string[]; permanent?: boolean }) =>
      bulkDeleteLeads(ids, permanent),
    onSuccess: (_, variables) => {
      // Manually filter out the deleted IDs from the cache to ensure UI is correct
      // even if the server's Redis cache for the list hasn't fully propagated yet.
      queryClient.setQueriesData<ListLeadsResponse>({ queryKey: ['leads'] }, (previous) => {
        if (!previous) return previous;
        const nextLeads = previous.leads.filter((lead) => !variables.ids.includes(lead.id));
        if (nextLeads.length === previous.leads.length) return previous;

        return {
          ...previous,
          leads: nextLeads,
          pagination: {
            ...previous.pagination,
            total: Math.max(0, previous.pagination.total - (previous.leads.length - nextLeads.length)),
          },
        };
      });

      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      
      const count = variables.ids.length;
      const action = variables.permanent ? 'permanently deleted' : 'archived';
      toast.success(`${count} leads ${action} successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to perform bulk operation');
    },
  });
};

export const useExtendLeadSlaMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof extendLeadSla>[1];
    }) => extendLeadSla(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      toast.success('Lead lifecycle timer extended');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to extend lead lifecycle timer');
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
