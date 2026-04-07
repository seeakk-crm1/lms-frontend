import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createLOBReason } from '../../../services/lobReasons.api';

export const useCreateLOBReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLOBReason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lob-reasons'] });
      toast.success('LOB reason created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create LOB reason');
    },
  });
};
