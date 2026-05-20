import { useMandatoryFollowUpContinuationQuery } from './useMandatoryFollowUpContinuation';
import useAuthStore from '../store/useAuthStore';

export const useMandatoryFollowUpBlocked = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const sessionRequired = useAuthStore((state) => state.mandatoryFollowupRequired);
  const enabled = Boolean(isAuthenticated && user?.isOnboarded);

  const query = useMandatoryFollowUpContinuationQuery(enabled);
  const items = query.data?.items ?? [];
  const hasPendingItems = items.length > 0;

  const blocked =
    enabled &&
    (hasPendingItems || (sessionRequired && (query.isLoading || query.isFetching || query.isPending)));

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
