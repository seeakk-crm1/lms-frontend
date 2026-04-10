import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import useClosedLeadsStore from '../store/closedLeadsStore';
import { exportClosedLeads, getClosedLeads, reopenLead, updateClosedLead } from '../services/leads.api';
import type { ClosedLeadListResponse, UpdateClosedLeadPayload } from '../types/lead.types';

export const useClosedLeadsQuery = () => {
  const { filters, search, pagination } = useClosedLeadsStore();

  return useQuery<ClosedLeadListResponse, Error>({
    queryKey: ['closed-leads', search, filters, pagination.page, pagination.limit],
    queryFn: () =>
      getClosedLeads({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        assignedTo: filters.assignedTo || undefined,
        source: filters.source || undefined,
        closureType: filters.closureType || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        minRevenue: filters.minRevenue ? Number(filters.minRevenue) : undefined,
        maxRevenue: filters.maxRevenue ? Number(filters.maxRevenue) : undefined,
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

export const useUpdateRevenueMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClosedLeadPayload }) => updateClosedLead(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['closed-leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Closed lead updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update revenue');
    },
  });
};

export const useReopenLeadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reopenLead(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['closed-leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead reopened successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reopen lead');
    },
  });
};

export const useExportClosedLeads = () =>
  useMutation({
    mutationFn: async (params: Record<string, unknown>) => {
      const response = await exportClosedLeads({ ...params, format: 'csv' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute('download', `seeakk-closed-leads-${stamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    },
    onSuccess: () => {
      toast.success('Closed leads export downloaded');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to export closed leads');
    },
  });
