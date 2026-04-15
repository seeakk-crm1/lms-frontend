import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useFollowUpReminderAlertsQuery } from '../../hooks/useFollowUps';
import useAuthStore from '../../store/useAuthStore';
import type { FollowUpReminderItem } from '../../types/followup.types';

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
  if (item.minutesUntil <= 0) {
    return `Follow-up for "${item.leadName}" is due now.`;
  }
  if (item.minutesUntil === 1) {
    return `Follow-up for "${item.leadName}" starts in 1 minute.`;
  }
  return `Follow-up for "${item.leadName}" starts in ${item.minutesUntil} minutes.`;
};

const FollowUpReminderListener: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const query = useFollowUpReminderAlertsQuery();
  const initialLoaded = useRef(false);

  const items = useMemo(() => query.data?.data?.items || [], [query.data]);

  useEffect(() => {
    if (!isAuthenticated || query.isLoading) return;

    // Skip first response after mount to prevent a flood of historical reminders.
    if (!initialLoaded.current) {
      initialLoaded.current = true;
      return;
    }

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
    });

    if (changed) writeSeenMap(seen);
  }, [isAuthenticated, items, query.isLoading]);

  return null;
};

export default FollowUpReminderListener;

