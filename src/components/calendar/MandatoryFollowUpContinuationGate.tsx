import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  useSaveMandatoryFollowUpContinuationMutation,
} from '../../hooks/useMandatoryFollowUpContinuation';
import { useMandatoryFollowUpBlocked } from '../../hooks/useMandatoryFollowUpBlocked';
import { useMandatoryNavigationLock } from '../../hooks/useMandatoryNavigationLock';
import MandatoryFollowUpContinuationModal from './MandatoryFollowUpContinuationModal';
import { useWeeklyOffScheduleGuard } from '../../hooks/useWeeklyOffScheduleGuard';
import { MANDATORY_FOLLOWUP_QUERY_KEY } from '../../constants/mandatoryFollowup.constants';
import { useInvalidateOverdueMandatory } from '../../hooks/useOverdueMandatoryFollowUps';

interface Props {
  children: React.ReactNode;
}

const MandatoryFollowUpContinuationGate: React.FC<Props> = ({ children }) => {
  const { blocked, enabled, items, query, clearSessionBlock, setSessionBlock } = useMandatoryFollowUpBlocked();
  const saveMutation = useSaveMandatoryFollowUpContinuationMutation();
  const queryClient = useQueryClient();
  const invalidateOverdue = useInvalidateOverdueMandatory();
  const { confirmIfWeeklyOff, WeeklyOffScheduleModal } = useWeeklyOffScheduleGuard();
  const [queueIndex, setQueueIndex] = useState(0);

  const activeItem = useMemo(() => items[queueIndex] ?? items[0] ?? null, [items, queueIndex]);

  const removeResolvedFromMandatoryCache = (leadId: string) => {
    queryClient.setQueryData(
      MANDATORY_FOLLOWUP_QUERY_KEY,
      (oldData: { data?: { items?: Array<{ leadId: string }>; mandatoryFollowupRequired?: boolean; mandatoryFollowupCount?: number } } | undefined) => {
        if (!oldData?.data?.items) return oldData;
        const nextItems = oldData.data.items.filter((item) => item.leadId !== leadId);
        return {
          ...oldData,
          data: {
            ...oldData.data,
            items: nextItems,
            mandatoryFollowupCount: nextItems.length,
            mandatoryFollowupRequired: nextItems.length > 0,
          },
        };
      },
    );
  };

  const advanceQueueAfterAction = async (resolvedLeadId: string) => {
    removeResolvedFromMandatoryCache(resolvedLeadId);
    setQueueIndex(0);
    invalidateOverdue();
    await query.refetch();
  };

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
          const proceed = await confirmIfWeeklyOff(payload.scheduledAt);
          if (!proceed) return;
          await saveMutation.mutateAsync({
            leadId: activeItem.leadId,
            scheduledAt: payload.scheduledAt,
            type: payload.type,
            description: payload.description || undefined,
          });
          await advanceQueueAfterAction(activeItem.leadId);
        }}
      />
    ) : null;

  if (!enabled) {
    return (
      <>
        {children}
        {WeeklyOffScheduleModal}
      </>
    );
  }

  useEffect(() => {
    if (query.isError) {
      toast.error('Unable to verify mandatory follow-ups.');
    }
  }, [query.isError]);

  return (
    <>
      {children}
      {blocked && modal && typeof document !== 'undefined' ? createPortal(modal, document.body) : modal}
      {WeeklyOffScheduleModal}
    </>
  );
};

export default MandatoryFollowUpContinuationGate;
