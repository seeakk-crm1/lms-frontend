import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Bell, CalendarClock, ChevronRight, ShieldAlert } from 'lucide-react';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getLeadApprovals } from '../../services/leads.api';
import { useFollowUpReminderAlertsQuery } from '../../hooks/useFollowUps';
import { useMandatoryFollowUpContinuationQuery } from '../../hooks/useMandatoryFollowUpContinuation';
import useAuthStore from '../../store/useAuthStore';
import { formatFollowUpTypeLabel } from '../../modules/followups/followUpTypeUi';
import { hasPermission } from '../../utils/permissions';
import type { LeadApprovalListResponse } from '../../types/lead.types';
import { getNotifications } from '../../services/attendance.api';

type NotificationEntry = {
  id: string;
  title: string;
  body: string;
  meta: string;
  category: 'mandatory' | 'approval' | 'followup' | 'system';
  onClick: () => void;
};

const formatRelativeTime = (value?: string | null): string => {
  if (!value) return 'Just now';
  try {
    return formatDistanceToNowStrict(parseISO(value), { addSuffix: true });
  } catch {
    return 'Just now';
  }
};

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const mandatoryFollowupCount = useAuthStore((state) => state.mandatoryFollowupCount);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const canViewApprovals = hasPermission(user, 'LEAD_APPROVAL_VIEW');

  const mandatoryQuery = useMandatoryFollowUpContinuationQuery(
    isAuthenticated && (isOpen || mandatoryFollowupCount > 0),
  );
  const alertsQuery = useFollowUpReminderAlertsQuery(isAuthenticated);
  const approvalsQuery = useQuery<LeadApprovalListResponse>({
    queryKey: ['dashboard-header', 'pending-approvals'],
    queryFn: () =>
      getLeadApprovals({
        page: 1,
        limit: 5,
        status: 'PENDING',
      }),
    enabled: isAuthenticated && canViewApprovals,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 422) return false;
      return failureCount < 2;
    },
  });

  const notificationsQuery = useQuery({
    queryKey: ['dashboard-header', 'notifications'],
    queryFn: () => getNotifications(),
    enabled: isAuthenticated,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const mandatoryItems = mandatoryQuery.data?.items ?? [];
  const followUpAlerts = alertsQuery.data?.data?.items ?? [];
  const approvalItems = approvalsQuery.data?.data ?? [];
  const approvalCount = approvalsQuery.data?.pagination?.total ?? 0;
  const mandatoryCount = mandatoryItems.length || mandatoryFollowupCount || 0;
  const followUpCount = followUpAlerts.length;
  const generalNotifications = notificationsQuery.data?.data ?? [];
  const unreadGeneralCount = generalNotifications.filter((n: any) => !n.isRead).length;
  const totalCount = mandatoryCount + approvalCount + followUpCount + unreadGeneralCount;
  const totalCountLabel = totalCount > 99 ? '99+' : String(totalCount);

  const notifications = useMemo<NotificationEntry[]>(() => {
    const nextNotifications: NotificationEntry[] = [];

    generalNotifications.slice(0, 5).forEach((item: any) => {
      nextNotifications.push({
        id: `system-${item.id}`,
        title: item.title,
        body: item.message,
        meta: formatRelativeTime(item.createdAt),
        category: 'system',
        onClick: () => {
          setIsOpen(false);
          navigate('/attendance');
        },
      });
    });

    if (mandatoryCount > 0) {
      if (mandatoryItems.length > 0) {
        mandatoryItems.slice(0, 2).forEach((item) => {
          nextNotifications.push({
            id: `mandatory-${item.leadId}`,
            title: `${item.leadName} needs a new follow-up`,
            body: `${item.stageName} · ${item.lifecycleName}`,
            meta:
              item.overdueDays > 0
                ? `Overdue by ${item.overdueDays} day${item.overdueDays === 1 ? '' : 's'}`
                : item.maxFollowUpDate
                  ? `Latest date ${item.maxFollowUpDate}`
                  : 'Schedule the next step',
            category: 'mandatory',
            onClick: () => {
              setIsOpen(false);
              navigate('/calendar');
            },
          });
        });
      } else {
        nextNotifications.push({
          id: 'mandatory-summary',
          title: `${mandatoryCount} mandatory follow-up${mandatoryCount === 1 ? '' : 's'} pending`,
          body: 'Some lifecycle leads require an immediate next follow-up to continue work.',
          meta: 'Open calendar to resolve',
          category: 'mandatory',
          onClick: () => {
            setIsOpen(false);
            navigate('/calendar');
          },
        });
      }
    }

    approvalItems.slice(0, 2).forEach((item) => {
      nextNotifications.push({
        id: `approval-${item.id}`,
        title: item.lead?.name || 'Lead approval pending',
        body: `${item.fromStage?.name || 'Unknown'} -> ${item.toStage?.name || 'Unknown'}`,
        meta: item.requestedBy?.displayName
          ? `Requested by ${item.requestedBy.displayName}`
          : formatRelativeTime(item.createdAt),
        category: 'approval',
        onClick: () => {
          setIsOpen(false);
          navigate('/leads/pending-approval');
        },
      });
    });

    followUpAlerts.slice(0, 3).forEach((item) => {
      nextNotifications.push({
        id: `followup-${item.id}`,
        title: `${formatFollowUpTypeLabel(item.type)} with ${item.leadName}`,
        body:
          item.minutesUntil <= 0
            ? 'This follow-up is due now.'
            : `Starts in ${item.minutesUntil} minute${item.minutesUntil === 1 ? '' : 's'}.`,
        meta: formatRelativeTime(item.scheduledAt),
        category: 'followup',
        onClick: () => {
          setIsOpen(false);
          navigate('/calendar/today');
        },
      });
    });

    return nextNotifications.slice(0, 6);
  }, [approvalItems, followUpAlerts, mandatoryCount, mandatoryItems, navigate]);

  const isLoading = mandatoryQuery.isLoading || approvalsQuery.isLoading || alertsQuery.isLoading || notificationsQuery.isLoading;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 sm:h-10 sm:w-10"
      >
        <Bell size={18} className="sm:hidden" />
        <Bell size={20} className="hidden sm:block" />
        {totalCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-black text-white shadow-lg shadow-emerald-500/30 ring-2 ring-white">
            {totalCountLabel}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[28px] border border-gray-100 bg-white/95 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur-xl"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-500">Notifications</p>
                  <h3 className="mt-1 text-lg font-black text-gray-900">Workspace updates</h3>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  {totalCount} active
                </div>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto px-3 py-3">
              {isLoading && notifications.length === 0 ? (
                <div className="space-y-3 p-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="h-3 w-24 rounded bg-gray-200" />
                      <div className="mt-3 h-4 w-40 rounded bg-gray-200" />
                      <div className="mt-2 h-3 w-52 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : null}

              {!isLoading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-sm">
                    <Bell size={24} />
                  </div>
                  <h4 className="mt-4 text-base font-black text-gray-900">All caught up</h4>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                    New follow-ups, approvals, and required actions will appear here.
                  </p>
                </div>
              ) : null}

              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((item) => {
                    const icon =
                      item.category === 'mandatory' ? (
                        <AlertTriangle size={16} />
                      ) : item.category === 'approval' ? (
                        <ShieldAlert size={16} />
                      ) : item.category === 'system' ? (
                        <Bell size={16} />
                      ) : (
                        <CalendarClock size={16} />
                      );

                    const iconClasses =
                      item.category === 'mandatory'
                        ? 'bg-amber-50 text-amber-600'
                        : item.category === 'approval'
                          ? 'bg-violet-50 text-violet-600'
                          : item.category === 'system'
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'bg-emerald-50 text-emerald-600';

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.onClick}
                        className="flex w-full items-start gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-left transition-all hover:border-emerald-100 hover:bg-emerald-50/40"
                      >
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClasses}`}>
                          {icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-black text-gray-900">{item.title}</p>
                            <ChevronRight size={16} className="mt-0.5 shrink-0 text-gray-300" />
                          </div>
                          <p className="mt-1 text-sm font-medium text-gray-600">{item.body}</p>
                          <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-gray-400">{item.meta}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
