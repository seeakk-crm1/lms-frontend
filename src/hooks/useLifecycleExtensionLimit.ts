import { useQuery } from '@tanstack/react-query';
import { getLifecycleExtensionLimit } from '../services/followupService';

export const lifecycleExtensionLimitQueryKey = (leadId?: string) =>
  ['followups', 'lifecycle-extension-limit', leadId] as const;

export const useLifecycleExtensionLimit = (leadId?: string | null, enabled = true) =>
  useQuery({
    queryKey: lifecycleExtensionLimitQueryKey(leadId || undefined),
    queryFn: () => getLifecycleExtensionLimit(leadId!),
    enabled: Boolean(leadId) && enabled,
    staleTime: 60_000,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404 || status === 401 || status === 403) return false;
      return failureCount < 2;
    },
  });
