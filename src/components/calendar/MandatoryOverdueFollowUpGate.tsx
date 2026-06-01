import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useOverdueMandatoryBlocked, useInvalidateOverdueMandatory } from '../../hooks/useOverdueMandatoryFollowUps';
import { useMandatoryNavigationLock } from '../../hooks/useMandatoryNavigationLock';
import useAuthStore from '../../store/useAuthStore';
import CompleteFollowUpModal from './CompleteFollowUpModal';
import SnoozeFollowUpModal from './SnoozeFollowUpModal';
import { useCompleteFollowUpMutation, useSnoozeFollowUpMutation } from '../../hooks/useFollowUps';
import { useWeeklyOffScheduleGuard } from '../../hooks/useWeeklyOffScheduleGuard';
import { toast } from 'react-hot-toast';
import type { FollowUp } from '../../types/followup.types';
import { stageBadgeStyle } from '../../utils/leadStageColor';

interface Props {
  children: React.ReactNode;
}

const MandatoryOverdueFollowUpGate: React.FC<Props> = ({ children }) => {
  const { blocked, enabled, items, query } = useOverdueMandatoryBlocked();
  const user = useAuthStore((state) => state.user);
  const invalidateOverdue = useInvalidateOverdueMandatory();
  const completeMutation = useCompleteFollowUpMutation();
  const snoozeMutation = useSnoozeFollowUpMutation();
  const { confirmIfWeeklyOff, WeeklyOffScheduleModal } = useWeeklyOffScheduleGuard();

  const [queueIndex, setQueueIndex] = useState(0);
  const [completeTarget, setCompleteTarget] = useState<FollowUp | null>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<FollowUp | null>(null);
  const [snoozeDateTime, setSnoozeDateTime] = useState('');
  const [recentDescription, setRecentDescription] = useState('');
  const [snoozeReasonId, setSnoozeReasonId] = useState('');
  const [reminderActionType, setReminderActionType] = useState<'SNOOZE' | 'REMIND_LATER'>('SNOOZE');

  const activeItem = useMemo(() => items[queueIndex] ?? items[0] ?? null, [items, queueIndex]);

  useMandatoryNavigationLock(blocked && enabled);

  useEffect(() => {
    setQueueIndex(0);
  }, [items.length, items[0]?.id]);

  useEffect(() => {
    if (!blocked) return undefined;

    const blockKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('keydown', blockKeys, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', blockKeys, true);
      document.body.style.overflow = previousOverflow;
    };
  }, [blocked]);

  const mapItemToFollowUp = (item: (typeof items)[number]): FollowUp => ({
    id: item.id,
    leadId: item.leadId,
    lead: {
      id: item.leadId,
      name: item.leadName,
      email: null,
      phone: null,
    },
    userId: user?.id || '',
    workspaceId: user?.workspaceId || '',
    type: item.type,
    description: item.description,
    completionDescription: null,
    status: item.status as FollowUp['status'],
    scheduledAt: item.scheduledAt,
    completedAt: null,
    createdAt: item.scheduledAt,
    updatedAt: item.scheduledAt,
    user: {
      id: user?.id || '',
      name: user?.name,
      username: user?.username,
      email: user?.email || '',
      displayName: user?.name || user?.email || '',
    },
    images: [],
  });

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {blocked ? (
        <>
          <div className="fixed inset-0 z-[9997] bg-slate-950/70 backdrop-blur-md" />
          {typeof document !== 'undefined'
            ? createPortal(
                <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
                  {query.isLoading ? (
                    <div className="flex flex-col items-center gap-3 text-white">
                      <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
                      <p className="text-sm font-bold">Checking overdue follow-ups…</p>
                    </div>
                  ) : activeItem ? (
                    <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-6 shadow-2xl">
                      <div className="mb-4 flex items-start gap-3">
                        <div className="rounded-2xl bg-red-50 p-3 text-red-500">
                          <AlertTriangle size={22} />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900">Overdue Follow-Up Required</h2>
                          <p className="mt-1 text-sm text-gray-500">
                            Complete or extend this follow-up before using the application (
                            {queueIndex + 1} of {items.length}).
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-gray-900">{activeItem.leadName}</p>
                          {activeItem.leadStage ? (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-black"
                              style={stageBadgeStyle(activeItem.leadStage.color)}
                            >
                              {activeItem.leadStage.name}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-gray-600">Customer: {activeItem.customerName}</p>
                        <p className="mt-1 text-gray-600">
                          Scheduled: {format(new Date(activeItem.scheduledAt), 'PPp')}
                        </p>
                        <p className="mt-1 font-bold text-red-600">Status: Overdue</p>
                      </div>

                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => setCompleteTarget(mapItemToFollowUp(activeItem))}
                          className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-black text-white hover:bg-emerald-600"
                        >
                          Complete Follow-Up
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSnoozeTarget(mapItemToFollowUp(activeItem));
                            setSnoozeDateTime('');
                            setRecentDescription('');
                            setSnoozeReasonId('');
                          }}
                          className="flex-1 rounded-2xl border border-amber-200 bg-amber-50 py-3 text-sm font-black text-amber-800 hover:bg-amber-100"
                        >
                          Extend Follow-Up
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>,
                document.body,
              )
            : null}
        </>
      ) : null}

      <CompleteFollowUpModal
        isOpen={Boolean(completeTarget)}
        followUp={completeTarget}
        isSubmitting={completeMutation.isPending}
        onClose={() => setCompleteTarget(null)}
        onSubmit={async (payload) => {
          if (!completeTarget) return;
          await completeMutation.mutateAsync({ id: completeTarget.id, payload });
          setCompleteTarget(null);
          invalidateOverdue();
          void query.refetch();
        }}
      />

      <SnoozeFollowUpModal
        isOpen={Boolean(snoozeTarget)}
        followUp={snoozeTarget}
        value={snoozeDateTime}
        onChange={setSnoozeDateTime}
        recentDescription={recentDescription}
        onRecentDescriptionChange={setRecentDescription}
        selectedReasonId={snoozeReasonId}
        onSelectedReasonIdChange={setSnoozeReasonId}
        reminderActionType={reminderActionType}
        onReminderActionTypeChange={setReminderActionType}
        isSubmitting={snoozeMutation.isPending}
        onClose={() => {
          setSnoozeTarget(null);
          setSnoozeDateTime('');
          setRecentDescription('');
          setSnoozeReasonId('');
        }}
        onSubmit={async () => {
          if (!snoozeTarget || !snoozeDateTime || (!snoozeReasonId && !recentDescription.trim())) return;
          const nextTime = new Date(snoozeDateTime);
          if (Number.isNaN(nextTime.getTime()) || nextTime.getTime() <= Date.now()) {
            toast.error('Please choose a future reminder time');
            return;
          }
          const proceed = await confirmIfWeeklyOff(nextTime);
          if (!proceed) return;
          await snoozeMutation.mutateAsync({
            id: snoozeTarget.id,
            payload: {
              scheduledAt: nextTime.toISOString(),
              recentDescription: recentDescription.trim() || undefined,
              extensionReasonId: snoozeReasonId || undefined,
              reminderActionType,
            },
          });
          setSnoozeTarget(null);
          invalidateOverdue();
          void query.refetch();
        }}
      />

      {WeeklyOffScheduleModal}
    </>
  );
};

export default MandatoryOverdueFollowUpGate;
