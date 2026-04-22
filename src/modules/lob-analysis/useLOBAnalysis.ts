import { useQuery } from '@tanstack/react-query';
import { getLOBAuditTrail, getLOBAnalysisSummary, getLOBStageBreakdown } from '../../services/lobAnalysis.api';
import type { LOBAnalysisFilters } from './types/lobAnalysis.types';

const shouldRetry = (failureCount: number, error: any) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403 || status === 422 || status === 429 || status === 503) return false;
  return failureCount < 1;
};

export const useLOBAnalysis = (filters: LOBAnalysisFilters, page = 1, limit = 20) => {
  const summaryQuery = useQuery({
    queryKey: ['lob-analysis', 'summary', filters],
    queryFn: () => getLOBAnalysisSummary(filters),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: shouldRetry,
  });

  const stageBreakdownQuery = useQuery({
    queryKey: ['lob-analysis', 'stage-breakdown', filters],
    queryFn: () => getLOBStageBreakdown(filters),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: shouldRetry,
  });

  const auditQuery = useQuery({
    queryKey: ['lob-analysis', 'audit', filters, page, limit],
    queryFn: () => getLOBAuditTrail({ ...filters, page, limit }),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: shouldRetry,
  });

  return {
    summary: summaryQuery.data?.data,
    chart: stageBreakdownQuery.data?.data,
    auditLogs: auditQuery.data?.data || [],
    auditPagination: auditQuery.data?.pagination,
    isLoading: summaryQuery.isLoading || stageBreakdownQuery.isLoading || auditQuery.isLoading,
    isFetching: summaryQuery.isFetching || stageBreakdownQuery.isFetching || auditQuery.isFetching,
    error: summaryQuery.error || stageBreakdownQuery.error || auditQuery.error,
    refetchAll: () => Promise.all([summaryQuery.refetch(), stageBreakdownQuery.refetch(), auditQuery.refetch()]),
  };
};
