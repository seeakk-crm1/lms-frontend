import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createReportType } from '../../../services/reportTypes.api';

export const useCreateReportType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReportType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-types'] });
      toast.success('Report type created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create report type');
    },
  });
};
