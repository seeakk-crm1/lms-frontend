import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  createSavedReport,
  deleteSavedReport,
  downloadSavedReport,
  generateSavedReport,
  getActiveReportTypes,
  getSavedReports,
  updateSavedReport,
} from '../../../services/reports.api';
import useReportStore from '../store/reportStore';

const shouldRetry = (failureCount: number, error: any) => {
  const status = error?.response?.status;
  if (status === 401 || status === 403 || status === 422 || status === 429) return false;
  return failureCount < 2;
};

export const useReportsQuery = () => {
  const { search, filters, page, limit } = useReportStore();

  return useQuery({
    queryKey: ['saved-reports', search, filters, page, limit],
    queryFn: () =>
      getSavedReports({
        page,
        limit,
        search: search || undefined,
        ...filters,
      }),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: shouldRetry,
  });
};

export const useActiveReportTypesQuery = () =>
  useQuery({
    queryKey: ['report-types', 'active', 'reports-page'],
    queryFn: getActiveReportTypes,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    retry: shouldRetry,
  });

export const useCreateReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavedReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Report created successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create report.');
    },
  });
};

export const useUpdateReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateSavedReport>[1] }) =>
      updateSavedReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Report updated successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update report.');
    },
  });
};

export const useGenerateReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => generateSavedReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Report generated successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to generate report.');
    },
  });
};

export const useDeleteReportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSavedReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      toast.success('Report deleted successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete report.');
    },
  });
};

export const useDownloadReportMutation = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const result = await downloadSavedReport(id);
      const link = document.createElement('a');
      link.href = result.fileUrl;
      link.download = `${result.report.reportName || 'report'}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      return result;
    },
    onSuccess: () => {
      toast.success('Report download started.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to download report.');
    },
  });
