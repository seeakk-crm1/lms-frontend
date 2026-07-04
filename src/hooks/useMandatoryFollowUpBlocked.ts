import { useMandatoryFollowUpContinuationQuery } from './useMandatoryFollowUpContinuation';
import useAuthStore from '../store/useAuthStore';
import { useAuthenticatedWorkflowEnabled } from './useAuthenticatedWorkflowEnabled';

export const useMandatoryFollowUpBlocked = () => {
  const sessionRequired = useAuthStore((state) => state.mandatoryFollowupRequired);
  const enabled = useAuthenticatedWorkflowEnabled();

  const query = useMandatoryFollowUpContinuationQuery(enabled);
  const items = query.data?.items ?? [];
  const hasPendingItems = items.length > 0;

  const blocked = enabled && hasPendingItems;

  return {
    blocked,
    enabled,
    items,
    activeItem: items[0] ?? null,
    query,
    sessionRequired,
    clearSessionBlock: useAuthStore.getState().clearMandatoryFollowupBlock,
    setSessionBlock: useAuthStore.getState().setMandatoryFollowupBlock,
  };
};
