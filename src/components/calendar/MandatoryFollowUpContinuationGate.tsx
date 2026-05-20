import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useSaveMandatoryFollowUpContinuationMutation,
} from '../../hooks/useMandatoryFollowUpContinuation';
import { useMandatoryFollowUpBlocked } from '../../hooks/useMandatoryFollowUpBlocked';
import { useMandatoryNavigationLock } from '../../hooks/useMandatoryNavigationLock';
import MandatoryFollowUpContinuationModal from './MandatoryFollowUpContinuationModal';

interface Props {
  children: React.ReactNode;
}

const MandatoryFollowUpContinuationGate: React.FC<Props> = ({ children }) => {
  const { blocked, enabled, items, query, clearSessionBlock, setSessionBlock } = useMandatoryFollowUpBlocked();
  const saveMutation = useSaveMandatoryFollowUpContinuationMutation();
  const [queueIndex, setQueueIndex] = useState(0);

  const activeItem = useMemo(() => items[queueIndex] ?? items[0] ?? null, [items, queueIndex]);

  useEffect(() => {
    if (!enabled) {
      clearSessionBlock();
      return;
    }

    if (query.isSuccess) {
      if (items.length > 0) {
        setSessionBlock(true, items.length);
      } else {
        clearSessionBlock();
      }
    }
  }, [clearSessionBlock, enabled, items.length, query.isSuccess, setSessionBlock]);

  useEffect(() => {
    setQueueIndex(0);
  }, [items.length, items[0]?.leadId]);

  useMandatoryNavigationLock(blocked);

  useEffect(() => {
    if (!blocked) return undefined;

    const blockKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const blockBackButton = () => {
      window.history.pushState(null, '', window.location.href);
    };

    document.addEventListener('keydown', blockKeys, true);
    window.addEventListener('popstate', blockBackButton);
    window.history.pushState(null, '', window.location.href);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', blockKeys, true);
      window.removeEventListener('popstate', blockBackButton);
      document.body.style.overflow = previousOverflow;
    };
  }, [blocked]);

  const modal =
    blocked && activeItem ? (
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
    ) : null;

  if (!enabled) {
    return <>{children}</>;
  }

  if (blocked) {
    const showLoader = !activeItem && (query.isLoading || query.isPending);
    const showRetry = !activeItem && query.isError;

    return (
      <>
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/70 backdrop-blur-md">
          {showLoader ? (
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
              <p className="text-sm font-bold tracking-wide">Checking mandatory follow-ups…</p>
            </div>
          ) : null}
          {showRetry ? (
            <div className="flex flex-col items-center gap-3 text-center text-white">
              <p className="text-sm font-bold">Unable to verify mandatory follow-ups.</p>
              <button
                type="button"
                onClick={() => void query.refetch()}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black text-white hover:bg-emerald-600"
              >
                Retry
              </button>
            </div>
          ) : null}
        </div>
        {modal && typeof document !== 'undefined' ? createPortal(modal, document.body) : modal}
      </>
    );
  }

  return <>{children}</>;
};

export default MandatoryFollowUpContinuationGate;
