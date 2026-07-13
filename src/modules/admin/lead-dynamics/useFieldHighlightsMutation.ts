import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import toast from 'react-hot-toast';

export const useFieldHighlightsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configs: { fieldKey: string; isEnabled: boolean }[]) => {
      const response = await api.put('/admin/field-highlights', { configs });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Field highlight configurations updated');
      queryClient.invalidateQueries({ queryKey: ['field-highlights'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update configurations');
    },
  });
};
