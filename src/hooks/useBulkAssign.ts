import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { bulkAssignLeads, previewBulkAssign } from '../services/leads.api';
import useBulkAssignStore from '../store/bulkAssignStore';
import type { BulkAssignPayload, BulkAssignPreviewResponse } from '../types/lead.types';

export const useBulkPreviewQuery = () => {
  const { appliedFilters, hasApplied, applyVersion, setPreviewCount, setPreviewLeads } = useBulkAssignStore();

  const query = useQuery<BulkAssignPreviewResponse, Error>({
    queryKey: ['bulk-assign-preview', appliedFilters, applyVersion],
    queryFn: () => previewBulkAssign(appliedFilters),
    enabled: hasApplied,
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 422) return false;
      return failureCount < 1;
    },
  });

  const queryData = query.data;
  const queryError = query.error;

  React.useEffect(() => {
    if (queryData) {
      setPreviewCount(queryData.count);
      setPreviewLeads(queryData.sampleLeads || []);
    }
  }, [queryData, setPreviewCount, setPreviewLeads]);

  React.useEffect(() => {
    if (queryError) {
      setPreviewCount(null);
      setPreviewLeads([]);
    }
  }, [queryError, setPreviewCount, setPreviewLeads]);

  return query;
};

export const useBulkAssignMutation = () => {
  const queryClient = useQueryClient();
  const { setLastResult, setProgress, setSelectedLeadIds } = useBulkAssignStore();

  return useMutation({
    mutationFn: (payload: BulkAssignPayload) => bulkAssignLeads(payload),
    onMutate: async (payload) => {
      setLastResult(null);
      setProgress({
        current: 0,
        total: 0,
        status: 'PREPARING',
        transport: 'SYNC_READY_FOR_WEBSOCKET',
      });

      return { payload };
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['bulk-assign-preview'] });
      setSelectedLeadIds([]);
      setLastResult({
        updatedCount: response.updated_count,
        failedCount: response.failed_count,
        failedLeadIds: response.failed_lead_ids,
        assignmentType: response.assignment_type,
      });
      setProgress({
        current: response.progress.current,
        total: response.progress.total,
        status: response.progress.status,
        transport: response.progress.transport,
      });
      toast.success(
        response.message
          ? `${response.message} (${response.updated_count} lead${response.updated_count === 1 ? '' : 's'} assigned)`
          : `Successfully assigned ${response.updated_count} lead${response.updated_count === 1 ? '' : 's'}`
      );
    },
    onError: (error: any) => {
      setProgress({
        status: 'FAILED',
      });
      toast.error(error?.response?.data?.message || 'Failed to bulk assign leads');
    },
  });
};
