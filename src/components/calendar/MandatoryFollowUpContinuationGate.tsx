import React, { useEffect, useMemo, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import {
  useMandatoryFollowUpContinuationQuery,
  useSaveMandatoryFollowUpContinuationMutation,
} from '../../hooks/useMandatoryFollowUpContinuation';
import MandatoryFollowUpContinuationModal from './MandatoryFollowUpContinuationModal';

interface Props {
  children: React.ReactNode;
}

const MandatoryFollowUpContinuationGate: React.FC<Props> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const enabled = Boolean(isAuthenticated && user?.isOnboarded);

  const query = useMandatoryFollowUpContinuationQuery(enabled);
  const saveMutation = useSaveMandatoryFollowUpContinuationMutation();
  const [queueIndex, setQueueIndex] = useState(0);

  const items = query.data?.items ?? [];
  const blocked = items.length > 0;

  const activeItem = useMemo(() => items[queueIndex] ?? items[0] ?? null, [items, queueIndex]);

  useEffect(() => {
    setQueueIndex(0);
  }, [items.length, items[0]?.leadId]);

  useEffect(() => {
    if (!blocked) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [blocked]);

  return (
    <>
      <div className={blocked ? 'pointer-events-none select-none' : undefined} aria-hidden={blocked}>
        {children}
      </div>
      {blocked && activeItem ? (
        <>
          <div className="fixed inset-0 z-[190] bg-slate-950/50 backdrop-blur-sm" aria-hidden />
          <MandatoryFollowUpContinuationModal
            item={activeItem}
            queuePosition={queueIndex + 1}
            queueTotal={items.length}
            isSubmitting={saveMutation.isPending}
            onSubmit={async (payload) => {
              await saveMutation.mutateAsync({
                leadId: activeItem.leadId,
                scheduledAt: payload.scheduledAt,
                type: payload.type,
                description: payload.description || undefined,
              });
            }}
          />
        </>
      ) : null}
    </>
  );
};

export default MandatoryFollowUpContinuationGate;
