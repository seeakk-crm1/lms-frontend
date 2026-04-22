import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { deleteLOBReason, toggleLOBReason } from '../../../services/lobReasons.api';
import type { LOBReasonStatus } from '../types/lobReason.types';

export const useToggleLOBReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status?: LOBReasonStatus }) => toggleLOBReason(id, status),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lob-reasons'] });
      toast.success(variables.status === 'ACTIVE' ? 'LOB reason activated' : 'LOB reason status updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update LOB reason status');
    },
  });
};

export const useDeleteLOBReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLOBReason(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lob-reasons'] });
      toast.success('LOB reason deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete LOB reason');
    },
  });
};
