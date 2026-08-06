import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useFollowUpReminderAlertsQuery } from '../../hooks/useFollowUps';
import { useCompleteFollowUpMutation, useSnoozeFollowUpMutation } from '../../hooks/useFollowUps';
import { useWeeklyOffScheduleGuard } from '../../hooks/useWeeklyOffScheduleGuard';
import { useAuthenticatedWorkflowEnabled } from '../../hooks/useAuthenticatedWorkflowEnabled';
import { useOverdueMandatoryBlocked } from '../../hooks/useOverdueMandatoryFollowUps';
import { useMandatoryFollowUpBlocked } from '../../hooks/useMandatoryFollowUpBlocked';
import { formatFollowUpTypeLabel } from '../../modules/followups/followUpTypeUi';
import type { FollowUp, FollowUpReminderItem } from '../../types/followup.types';
import FollowUpActionModal from './FollowUpActionModal';
import CompleteFollowUpModal from './CompleteFollowUpModal';
import SnoozeFollowUpModal from './SnoozeFollowUpModal';

const storageKey = 'followupReminderSeenAt';

const readSeenMap = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const writeSeenMap = (value: Record<string, number>): void => {
  localStorage.setItem(storageKey, JSON.stringify(value));
};

const shouldAlert = (item: FollowUpReminderItem, seenMap: Record<string, number>): boolean => {
  const scheduledAtMs = new Date(item.scheduledAt).getTime();
  if (Number.isNaN(scheduledAtMs)) return false;

  const lastSeenAt = seenMap[item.id] || 0;
  // Re-alert at most every 10 minutes for same follow-up while still pending.
  if (Date.now() - lastSeenAt < 10 * 60_000) return false;

  return true;
};

const maybeNotifyBrowser = (title: string, body: string): void => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
    return;
  }

  if (Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
};

const buildAlertMessage = (item: FollowUpReminderItem): string => {
  const kind = formatFollowUpTypeLabel(item.type);
  if (item.minutesUntil <= 0) {
    return `${kind} follow-up for "${item.leadName}" is due now.`;
  }
  if (item.minutesUntil === 1) {
    return `${kind} follow-up for "${item.leadName}" starts in 1 minute.`;
  }
  return `${kind} follow-up for "${item.leadName}" starts in ${item.minutesUntil} minutes.`;
};

const FollowUpReminderListener: React.FC = () => {
  const workflowEnabled = useAuthenticatedWorkflowEnabled();
  const { blocked: overdueMandatoryBlocked } = useOverdueMandatoryBlocked();
  const { blocked: lifecycleMandatoryBlocked } = useMandatoryFollowUpBlocked();
  const remindersEnabled =
    workflowEnabled && !overdueMandatoryBlocked && !lifecycleMandatoryBlocked;
  const navigate = useNavigate();
  const query = useFollowUpReminderAlertsQuery(remindersEnabled);
  const completeMutation = useCompleteFollowUpMutation();
  const snoozeMutation = useSnoozeFollowUpMutation();
  const { confirmIfWeeklyOff, WeeklyOffScheduleModal } = useWeeklyOffScheduleGuard();
  const initialLoaded = useRef(false);
  const [queue, setQueue] = useState<FollowUp[]>([]);
  const [active, setActive] = useState<FollowUp | null>(null);
  const [completionTarget, setCompletionTarget] = useState<FollowUp | null>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<FollowUp | null>(null);
  const [snoozeDateTime, setSnoozeDateTime] = useState('');
  const [recentDescription, setRecentDescription] = useState('');
  const [snoozeReasonId, setSnoozeReasonId] = useState('');
  const [reminderActionType, setReminderActionType] = useState<'SNOOZE' | 'REMIND_LATER'>('SNOOZE');

  const items = useMemo(() => query.data?.data?.items || [], [query.data]);
  const toFollowUp = (item: FollowUpReminderItem): FollowUp => ({
    id: item.id,
    leadId: item.leadId,
    lead: {
      id: item.leadId,
      name: item.leadName,
      email: null,
      phone: item.leadPhone || null,
      profileImage: item.leadProfileImage || null,
      stage: item.leadStage || null,
    },
    assignedUserName: item.assignedUserName,
    officeName: item.officeName || null,
    priority: item.priority || null,
    userId: item.userId,
    workspaceId: '',
    type: item.type,
    description: item.description,
    completionDescription: null,
    status: item.status || 'PENDING',
    scheduledAt: item.scheduledAt,
    completedAt: null,
    recentDescription: item.latestFollowupNote || null,
    createdAt: item.scheduledAt,
    updatedAt: item.scheduledAt,
    user: item.user,
    images: [],
  });

  useEffect(() => {
    if (!workflowEnabled || query.isLoading) return;

    if (items.length === 0) return;

    const seen = readSeenMap();
    let changed = false;

    items.forEach((item) => {
      if (!shouldAlert(item, seen)) return;

      const message = buildAlertMessage(item);
      toast(message, {
        icon: '⏰',
        duration: 8000,
      });
      maybeNotifyBrowser('Follow-up Reminder', message);

      seen[item.id] = Date.now();
      changed = true;
      setQueue((current) => [...current, toFollowUp(item)]);
    });

    if (changed) writeSeenMap(seen);
  }, [workflowEnabled, items, query.isLoading]);

  useEffect(() => {
    if (!active && queue.length > 0) {
      setActive(queue[0]);
      setQueue((current) => current.slice(1));
    }
  }, [active, queue]);

  if (!workflowEnabled) {
    return null;
  }

  return (
    <>
      <FollowUpActionModal
        isOpen={Boolean(active)}
        followUp={active}
        onClose={() => setActive(null)}
        onOpenLead={(followUp) => {
          navigate('/leads', { state: { openLeadId: followUp.leadId } });
          setActive(null);
        }}
        onMarkCompleted={(followUp) => {
          setCompletionTarget(followUp);
          setActive(null);
        }}
        onSnooze={(followUp) => {
          setSnoozeTarget(followUp);
          setSnoozeDateTime('');
          setRecentDescription('');
          setSnoozeReasonId('');
          setReminderActionType('SNOOZE');
          setActive(null);
        }}
      />
      <CompleteFollowUpModal
        isOpen={Boolean(completionTarget)}
        followUp={completionTarget}
        isSubmitting={completeMutation.isPending}
        onClose={() => setCompletionTarget(null)}
        onSubmit={async (payload) => {
          if (!completionTarget) return;
          await completeMutation.mutateAsync({ id: completionTarget.id, payload });
          setCompletionTarget(null);
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
          setReminderActionType('SNOOZE');
        }}
        onSubmit={async () => {
          const hasInput = snoozeReasonId || recentDescription.trim();
          if (!snoozeTarget || !snoozeDateTime || !hasInput) return;
          const date = new Date(snoozeDateTime);
          if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
            toast.error('Please choose a future reminder time');
            return;
          }
          if (date.getTime() === new Date(snoozeTarget.scheduledAt).getTime()) {
            toast.error('The new follow-up date must be different from the current scheduled date.');
            return;
          }
          const proceed = await confirmIfWeeklyOff(date);
          if (!proceed) return;
          await snoozeMutation.mutateAsync({
            id: snoozeTarget.id,
            payload: {
              scheduledAt: date.toISOString(),
              recentDescription: recentDescription.trim() || undefined,
              extensionReasonId: snoozeReasonId || undefined,
              reminderActionType,
            },
          });
          setSnoozeTarget(null);
          setSnoozeDateTime('');
          setRecentDescription('');
          setSnoozeReasonId('');
          setReminderActionType('SNOOZE');
        }}
      />
      {WeeklyOffScheduleModal}
    </>
  );
};

export default FollowUpReminderListener;

