import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { deleteReportType, generateReport, toggleReportType } from '../../../services/reportTypes.api';
import type { GeneratedReportResponse, ReportExecutionFilter, ReportTypeStatus } from '../types/reportType.types';

export const useToggleReportType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: ReportTypeStatus }) => toggleReportType(id, status),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report-types'] });
      toast.success(variables.status === 'ACTIVE' ? 'Report type activated' : 'Report type updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update report type status');
    },
  });
};

export const useDeleteReportType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReportType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-types'] });
      toast.success('Report type deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete report type');
    },
  });
};

export const useGenerateReport = () =>
  useMutation<GeneratedReportResponse, Error, { reportTypeId: string; filters: ReportExecutionFilter[]; page?: number; limit?: number }>({
    mutationFn: generateReport,
  });
