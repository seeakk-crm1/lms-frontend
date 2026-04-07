import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { updateReportType } from '../../../services/reportTypes.api';
import type { ReportTypePayload } from '../types/reportType.types';

export const useUpdateReportType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ReportTypePayload> }) => updateReportType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-types'] });
      toast.success('Report type updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update report type');
    },
  });
};
