import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { AlertTriangle, Loader2, PhoneCall, ArrowRight } from 'lucide-react';
import { useFollowupWorkflowStore } from '../../store/followupWorkflowStore';
import {
  useOverdueMandatoryBlocked,
  useInvalidateOverdueMandatory,
  OVERDUE_MANDATORY_QUERY_KEY,
} from '../../hooks/useOverdueMandatoryFollowUps';
import { useQueryClient } from '@tanstack/react-query';
import { useMandatoryNavigationLock } from '../../hooks/useMandatoryNavigationLock';
import useAuthStore from '../../store/useAuthStore';
import CompleteFollowUpModal from './CompleteFollowUpModal';
import SnoozeFollowUpModal from './SnoozeFollowUpModal';
import { useCompleteFollowUpMutation, useSnoozeFollowUpMutation } from '../../hooks/useFollowUps';
import { useWeeklyOffScheduleGuard } from '../../hooks/useWeeklyOffScheduleGuard';
import { toast } from 'react-hot-toast';
import type { FollowUp } from '../../types/followup.types';
import { stageBadgeStyle } from '../../utils/leadStageColor';
import BulkExtendOverdueModal from './BulkExtendOverdueModal';
import { bulkExtendFollowUps } from '../../services/followupSettings.api';
import FollowUpContextCard from './FollowUpContextCard';
import WhatsAppActionButton from '../common/WhatsAppActionButton';
import { LEAD_WHATSAPP_PERMISSIONS } from '../../constants/whatsappPermissions';
import { formatPhoneWithFlag } from '../../utils/phoneUtils';

interface Props {
  children: React.ReactNode;
}

const MandatoryOverdueFollowUpGate: React.FC<Props> = ({ children }) => {
  const { blocked, enabled, items, query } = useOverdueMandatoryBlocked();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
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

  // Bulk Extend State
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [selectedBulkItems, setSelectedBulkItems] = useState<string[]>([]);
  const [bulkTargetDate, setBulkTargetDate] = useState('');
  const [bulkReasonId, setBulkReasonId] = useState('');
  const [bulkDescription, setBulkDescription] = useState('');
  const [bulkAutoDistribute, setBulkAutoDistribute] = useState(false);
  const [isBulkExtending, setIsBulkExtending] = useState(false);

  const hasBulkAccess = user?.permissions?.includes('bulk_extend_followups');

  const isEditingFromFollowup = useFollowupWorkflowStore((state) => state.isEditingFromFollowup);

  const activeItem = useMemo(() => items[queueIndex] ?? items[0] ?? null, [items, queueIndex]);
  const actionModalOpen = Boolean(completeTarget || snoozeTarget || bulkModalOpen);

  useMandatoryNavigationLock(blocked && enabled && !actionModalOpen && !isEditingFromFollowup);

  useEffect(() => {
    setQueueIndex(0);
  }, [items.length, items[0]?.id]);

  useEffect(() => {
    if (queueIndex >= items.length && items.length > 0) {
      setQueueIndex(0);
    }
  }, [items.length, queueIndex]);

  const removeResolvedFromOverdueCache = (resolvedId: string) => {
    queryClient.setQueryData(
      OVERDUE_MANDATORY_QUERY_KEY,
      (oldData: { data?: { items?: Array<{ id: string }>; overdueFollowupRequired?: boolean; overdueFollowupCount?: number } } | undefined) => {
        if (!oldData?.data?.items) return oldData;
        const nextItems = oldData.data.items.filter((item) => item.id !== resolvedId);
        return {
          ...oldData,
          data: {
            ...oldData.data,
            items: nextItems,
            overdueFollowupCount: nextItems.length,
            overdueFollowupRequired: nextItems.length > 0,
          },
        };
      },
    );
  };

  const advanceQueueAfterAction = async (resolvedId: string) => {
    removeResolvedFromOverdueCache(resolvedId);
    setQueueIndex(0);
    invalidateOverdue();
    await query.refetch();
  };

  useEffect(() => {
    if (!blocked || isEditingFromFollowup) return undefined;

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
  }, [blocked, isEditingFromFollowup]);

  const mapItemToFollowUp = (item: (typeof items)[number]): FollowUp => ({
    id: item.id,
    leadId: item.leadId,
    lead: {
      id: item.leadId,
      name: item.leadName,
      email: item.leadEmail || null,
      phone: item.leadPhone || (item.customerName && /^\+?\d[\d\s-]{6,}$/.test(item.customerName.trim()) ? item.customerName.trim() : null),
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

      {blocked && !actionModalOpen && !isEditingFromFollowup ? (
        <>
          <div className="fixed inset-0 z-[9997] bg-slate-950/70 backdrop-blur-md" />
          {typeof document !== 'undefined'
            ? createPortal(
                <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
                  {activeItem ? (
                    <div className="w-full max-w-2xl rounded-3xl border border-red-100 bg-white p-6 shadow-2xl">
                      <div className="mb-4 flex items-start gap-3">
                        <div className="rounded-2xl bg-red-50 p-3 text-red-500">
                          <AlertTriangle size={22} />
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-gray-900">Overdue Follow-Up Required</h2>
                          <p className="mt-1 text-sm text-gray-500">
                            {hasBulkAccess && items.length > 1
                              ? `You have ${items.length} overdue follow-ups. You can bulk extend them or process them individually.`
                              : `Complete or extend this follow-up before using the application (${queueIndex + 1} of ${items.length}).`}
                          </p>
                        </div>
                      </div>

                      {hasBulkAccess && items.length > 1 ? (
                        <div className="mb-5 overflow-y-auto max-h-[300px] border border-gray-100 rounded-2xl">
                          <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-gray-50/50 text-xs font-black uppercase text-gray-400">
                              <tr>
                                <th className="py-2.5 px-4 w-12 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedBulkItems.length === items.length && items.length > 0}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedBulkItems(items.map(i => i.id));
                                      else setSelectedBulkItems([]);
                                    }}
                                    className="w-4 h-4 accent-amber-500 rounded"
                                  />
                                </th>
                                <th className="py-2.5 px-4">Lead</th>
                                <th className="py-2.5 px-4">Scheduled</th>
                                <th className="py-2.5 px-4">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map(item => (
                                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/30">
                                  <td className="py-2 px-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={selectedBulkItems.includes(item.id)}
                                      onChange={() => {
                                        setSelectedBulkItems(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])
                                      }}
                                      className="w-4 h-4 accent-amber-500 rounded"
                                    />
                                  </td>
                                  <td className="py-2 px-4 font-semibold text-gray-800">
                                    {item.leadName}
                                    <div className="text-[11px] text-gray-400 font-normal">{item.customerName}</div>
                                  </td>
                                  <td className="py-2 px-4 text-gray-500 text-xs">
                                    {format(new Date(item.scheduledAt), 'MMM d, h:mm a')}
                                  </td>
                                  <td className="py-2 px-4">
                                    <button
                                      type="button"
                                      onClick={() => setCompleteTarget(mapItemToFollowUp(item))}
                                      className="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                                    >
                                      Complete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Lead Profile Header Card with Quick Actions */}
                          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-gray-900 text-base">{activeItem.leadName}</p>
                                  {activeItem.leadStage ? (
                                    <span
                                      className="rounded-full px-2.5 py-0.5 text-[10px] font-black"
                                      style={stageBadgeStyle(activeItem.leadStage.color)}
                                    >
                                      {activeItem.leadStage.name}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-1 text-xs text-gray-600">Customer: {activeItem.customerName}</p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                  Scheduled: {format(new Date(activeItem.scheduledAt), 'PPp')}
                                </p>
                              </div>

                              {/* Call & WhatsApp Quick Actions */}
                              {(() => {
                                const validPhone =
                                  activeItem.leadPhone ||
                                  (activeItem.customerName && /^\+?\d[\d\s-]{6,}$/.test(activeItem.customerName.trim())
                                    ? activeItem.customerName.trim()
                                    : null);

                                  return (
                                    <div className="flex items-center gap-2 shrink-0">
                                      {validPhone ? (
                                        <>
                                          <a
                                            href={`tel:${validPhone.replace(/[^0-9+]/g, '')}`}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors ring-1 ring-blue-100"
                                          >
                                            <PhoneCall className="h-3.5 w-3.5" />
                                            Call
                                          </a>
                                          <WhatsAppActionButton
                                            phone={validPhone}
                                            variant="cta"
                                            stopPropagation={false}
                                            requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                                            title="WhatsApp"
                                            audit={{
                                              entityType: 'FollowUp',
                                              entityId: activeItem.id,
                                              entityName: activeItem.leadName,
                                            }}
                                          />
                                        </>
                                      ) : null}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const followup = mapItemToFollowUp(activeItem);
                                          useFollowupWorkflowStore.getState().startWorkflow(items.map(mapItemToFollowUp), 'MANDATORY', queueIndex);
                                          useFollowupWorkflowStore.getState().openLeadFromFollowup(followup, 'MANDATORY');
                                        }}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gray-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-gray-800 transition-colors shadow-xs"
                                      >
                                        <ArrowRight className="h-3.5 w-3.5" />
                                        Open Lead
                                      </button>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Context Card: Latest Follow-up Note & Latest Lead Remark */}
                            <FollowUpContextCard leadId={activeItem.leadId} />
                          </div>
                        )}

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                          {hasBulkAccess && items.length > 1 ? (
                            <button
                              type="button"
                              disabled={selectedBulkItems.length === 0}
                              onClick={() => {
                                setBulkTargetDate('');
                                setBulkReasonId('');
                                setBulkDescription('');
                                setBulkAutoDistribute(false);
                                setBulkModalOpen(true);
                              }}
                              className="flex-1 rounded-2xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Bulk Extend Selected ({selectedBulkItems.length})
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const followup = mapItemToFollowUp(activeItem);
                                  useFollowupWorkflowStore.getState().startWorkflow(items.map(mapItemToFollowUp), 'MANDATORY', queueIndex);
                                  useFollowupWorkflowStore.getState().openLeadFromFollowup(followup, 'MANDATORY');
                                }}
                                className="inline-flex items-center justify-center gap-2 flex-1 rounded-2xl bg-gray-900 py-3 text-sm font-black text-white hover:bg-gray-800 transition-colors"
                              >
                                <ArrowRight className="h-4 w-4" />
                                Open Lead
                              </button>
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
                            </>
                          )}
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
        stackAboveMandatoryGate
        onClose={() => setCompleteTarget(null)}
        onSubmit={async (payload) => {
          if (!completeTarget) return;
          const resolvedId = completeTarget.id;
          await completeMutation.mutateAsync({ id: resolvedId, payload });
          setCompleteTarget(null);
          await advanceQueueAfterAction(resolvedId);
        }}
      />

      <SnoozeFollowUpModal
        isOpen={Boolean(snoozeTarget)}
        followUp={snoozeTarget}
        stackAboveMandatoryGate
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
          const resolvedId = snoozeTarget.id;
          await snoozeMutation.mutateAsync({
            id: resolvedId,
            payload: {
              scheduledAt: nextTime.toISOString(),
              recentDescription: recentDescription.trim() || undefined,
              extensionReasonId: snoozeReasonId || undefined,
              reminderActionType,
            },
          });
          setSnoozeTarget(null);
          setSnoozeDateTime('');
          setRecentDescription('');
          setSnoozeReasonId('');
          await advanceQueueAfterAction(resolvedId);
        }}
      />

      <BulkExtendOverdueModal
        isOpen={bulkModalOpen}
        selectedCount={selectedBulkItems.length}
        value={bulkTargetDate}
        onChange={setBulkTargetDate}
        recentDescription={bulkDescription}
        onRecentDescriptionChange={setBulkDescription}
        selectedReasonId={bulkReasonId}
        onSelectedReasonIdChange={setBulkReasonId}
        autoDistribute={bulkAutoDistribute}
        onAutoDistributeChange={setBulkAutoDistribute}
        isSubmitting={isBulkExtending}
        stackAboveMandatoryGate
        onClose={() => setBulkModalOpen(false)}
        onSubmit={async () => {
          if (!bulkTargetDate) {
            toast.error('Please choose a new target date');
            return;
          }
          if (!bulkReasonId && !bulkDescription.trim()) {
            toast.error('Please provide a reason or description');
            return;
          }
          const nextTime = new Date(bulkTargetDate);
          if (Number.isNaN(nextTime.getTime()) || nextTime.getTime() <= Date.now()) {
            toast.error('Please choose a future date');
            return;
          }
          const proceed = await confirmIfWeeklyOff(nextTime);
          if (!proceed) return;

          try {
            setIsBulkExtending(true);
            const res = await bulkExtendFollowUps({
              followUpIds: selectedBulkItems,
              newFollowupDate: new Date(bulkTargetDate).toISOString(),
              extensionReasonId: bulkReasonId || undefined,
              recentDescription: bulkDescription.trim() || undefined,
              autoDistribute: bulkAutoDistribute,
            });
            if (res.success) {
              const movedIds = res.successIds ?? [];
              const movedCount = res.movedCount ?? res.successCount ?? movedIds.length;
              const remainingUnresolved =
                res.remainingCount ?? res.blockedCount ?? Math.max(0, selectedBulkItems.length - movedCount);

              if (movedCount === 0) {
                const statsSuffix =
                  res.selectedCount != null && res.availableSlots != null
                    ? ` Selected: ${res.selectedCount}. Moved: 0. Remaining: ${remainingUnresolved}. Available slots: ${res.availableSlots}.`
                    : '';
                toast.error((res.message || 'No follow-ups could be extended for the selected date.') + statsSuffix, {
                  duration: 7000,
                });
                return;
              }

              const statsSuffix =
                res.selectedCount != null && res.availableSlots != null
                  ? ` Selected: ${res.selectedCount}. Moved: ${movedCount}. Remaining: ${remainingUnresolved}. Available slots: ${res.availableSlots}.`
                  : '';
              toast.success((res.message || `Successfully extended ${movedCount} follow-up(s).`) + statsSuffix, {
                duration: 7000,
              });

              setBulkModalOpen(false);
              setBulkTargetDate('');
              setBulkReasonId('');
              setBulkDescription('');
              setBulkAutoDistribute(false);

              movedIds.forEach((id) => removeResolvedFromOverdueCache(id));
              setSelectedBulkItems((prev) => prev.filter((id) => !movedIds.includes(id)));

              if (res.overdueSession) {
                queryClient.setQueryData(OVERDUE_MANDATORY_QUERY_KEY, {
                  success: true,
                  message: res.message,
                  data: res.overdueSession,
                });
              }

              setQueueIndex(0);
              invalidateOverdue();

              const refetched = res.overdueSession ? { data: { data: res.overdueSession } } : await query.refetch();
              const overdueRemaining = refetched.data?.data?.items?.length ?? 0;
              if (overdueRemaining === 0) {
                useAuthStore.getState().clearMandatoryFollowupBlock();
              }
            }
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to bulk extend follow-ups');
          } finally {
            setIsBulkExtending(false);
          }
        }}
      />

      {WeeklyOffScheduleModal}
    </>
  );
};

export default MandatoryOverdueFollowUpGate;
