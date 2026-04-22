import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { updateLOBReason } from '../../../services/lobReasons.api';
import type { LOBReasonPayload } from '../types/lobReason.types';

export const useUpdateLOBReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LOBReasonPayload> }) => updateLOBReason(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lob-reasons'] });
      toast.success('LOB reason updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update LOB reason');
    },
  });
};
