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
  });
