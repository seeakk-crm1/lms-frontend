import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getLeadApprovals, updateLeadApproval } from '../services/leads.api';
import useApprovalStore from '../store/approvalStore';
import type { LeadApprovalActionPayload, LeadApprovalListResponse } from '../types/lead.types';

export const useApprovalsQuery = () => {
  const { filters, pagination, setApprovals, setPagination, setLoading } = useApprovalStore();

  return useQuery<LeadApprovalListResponse, Error>({
    queryKey: ['lead-approvals', filters, pagination.page, pagination.limit],
    queryFn: () =>
      getLeadApprovals({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      }),
    staleTime: 30_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 422) return false;
      return failureCount < 2;
    },
    onSuccess: (response) => {
      setApprovals(response.data || []);
      setPagination(response.pagination || {});
      setLoading(false);
    },
    onError: () => {
      setApprovals([]);
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useApprovalActionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LeadApprovalActionPayload }) => updateLeadApproval(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['lead-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead'] });
      toast.success(response?.message || 'Approval processed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to process approval');
    },
  });
};
