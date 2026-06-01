import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  createExtensionReason,
  deleteExtensionReason,
  getActiveExtensionReasons,
  getExtensionReasons,
  toggleExtensionReason,
  updateExtensionReason,
} from '../../../services/followupExtensionReasons.api';
import useExtensionReasonStore from '../store/followupExtensionReasonsStore';
import type { ExtensionReasonPayload } from '../types/followUpExtensionReason.types';

export const useExtensionReasonsQuery = () => {
  const { search, isActive, page, limit } = useExtensionReasonStore();

  return useQuery({
    queryKey: ['followup-extension-reasons', { search, isActive, page, limit }],
    queryFn: () =>
      getExtensionReasons({
        page,
        limit,
        search: search.trim() || undefined,
        isActive: isActive === 'ALL' ? undefined : isActive,
      }),
    staleTime: 60_000,
    gcTime: 300_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const responseStatus = error?.response?.status;
      if (responseStatus === 401 || responseStatus === 403 || responseStatus === 422) return false;
      return failureCount < 1;
    },
  });
};

export const useActiveExtensionReasonsQuery = (enabled = true) =>
  useQuery({
    queryKey: ['followup-extension-reasons', 'active'],
    queryFn: getActiveExtensionReasons,
    select: (response) => response.data,
    enabled,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      const responseStatus = error?.response?.status;
      if (responseStatus === 401 || responseStatus === 403 || responseStatus === 422 || responseStatus === 423) {
        return false;
      }
      return failureCount < 1;
    },
  });

export const useCreateExtensionReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExtensionReason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-extension-reasons'] });
      toast.success('Follow-up extension reason created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create reason');
    },
  });
};

export const useUpdateExtensionReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ExtensionReasonPayload> }) =>
      updateExtensionReason(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-extension-reasons'] });
      toast.success('Follow-up extension reason updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update reason');
    },
  });
};

export const useToggleExtensionReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleExtensionReason(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-extension-reasons'] });
      toast.success('Status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update status');
    },
  });
};

export const useDeleteExtensionReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExtensionReason,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followup-extension-reasons'] });
      toast.success('Follow-up extension reason deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete reason');
    },
  });
};
