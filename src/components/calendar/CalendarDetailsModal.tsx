import React from 'react';
import { format } from 'date-fns';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdvancedCalendarDetailsQuery } from '../../hooks/useFollowUps';
import FollowUpCard from './FollowUpCard';
import WhatsAppActionButton from '../common/WhatsAppActionButton';
import { LEAD_WHATSAPP_PERMISSIONS } from '../../constants/whatsappPermissions';
import {
  isFollowUpCalendarDetailType,
  type CalendarOverdueStatus,
  type FollowUp,
} from '../../types/followup.types';
import { stageBadgeStyle } from '../../utils/leadStageColor';

const isLateOverdueStatus = (status?: CalendarOverdueStatus | string): boolean =>
  status === 'OVERDUE' ||
  status === 'OVERDUE_EXTENDED' ||
  status === 'LATE_COMPLETED' ||
  status === 'LATE_EXTENDED';

const overdueStatusLabel = (status?: CalendarOverdueStatus | string): string => {
  switch (status) {
    case 'LATE_COMPLETED':
      return 'Late Completed';
    case 'LATE_EXTENDED':
    case 'OVERDUE_EXTENDED':
      return 'Late Extended';
    case 'OVERDUE':
      return 'Overdue';
    default:
      return 'On Time';
  }
};

interface CalendarDetailsModalProps {
  isOpen: boolean;
  date: string;
  type: string;
  stageId?: string;
  title: string;
  overdueExtendedOnly?: boolean;
  onClose: () => void;
  onOpenFollowUp?: (followUp: FollowUp) => void;
  onCompleteFollowUp?: (followUp: FollowUp) => void;
  onOpenLead?: (lead: any) => void;
}

const CalendarDetailsModal: React.FC<CalendarDetailsModalProps> = ({
  isOpen,
  date,
  type,
  stageId,
  title,
  overdueExtendedOnly,
  onClose,
  onOpenFollowUp,
  onCompleteFollowUp,
  onOpenLead,
}) => {
  const { data, isLoading } = useAdvancedCalendarDetailsQuery({
    date,
    type,
    stageId,
    limit: 100,
    overdueExtendedOnly,
  });

  const isFollowUpDetail = isFollowUpCalendarDetailType(type);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[150] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative flex max-h-[85vh] w-full max-w-3xl flex-col rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">{title}</h3>
                <p className="mt-1 text-xs font-semibold text-gray-500">{format(new Date(date), 'EEEE, MMMM do, yyyy')}</p>
              </div>
              <button onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : data?.items?.length ? (
                <div className="space-y-3">
                  {data.items.map((item: any) => {
                    if (isFollowUpDetail) {
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border p-4 ${
                            isLateOverdueStatus(item.overdueStatus)
                              ? 'border-red-200 bg-red-50/60'
                              : 'border-gray-100 bg-gray-50/50'
                          }`}
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-black text-gray-900">{item.lead?.name || item.leadName}</h4>
                            {item.leadStage || item.lead?.stage ? (
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-black"
                                style={stageBadgeStyle((item.leadStage || item.lead?.stage)?.color)}
                              >
                                {(item.leadStage || item.lead?.stage)?.name}
                              </span>
                            ) : null}
                          </div>
                          <dl className="grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                            <div>
                              <dt className="font-bold uppercase tracking-wide text-gray-400">Customer</dt>
                              <dd className="font-semibold text-gray-800">{item.customerName || '—'}</dd>
                            </div>
                            <div>
                              <dt className="font-bold uppercase tracking-wide text-gray-400">Scheduled Date</dt>
                              <dd className="font-semibold text-gray-800">
                                {item.scheduledAt ? format(new Date(item.scheduledAt), 'PPp') : '—'}
                              </dd>
                            </div>
                            {item.completedAt ? (
                              <div>
                                <dt className="font-bold uppercase tracking-wide text-gray-400">Completed Date</dt>
                                <dd className="font-semibold text-gray-800">
                                  {format(new Date(item.completedAt), 'PPp')}
                                </dd>
                              </div>
                            ) : null}
                            {item.snoozedAt || item.newFollowupDate ? (
                              <div>
                                <dt className="font-bold uppercase tracking-wide text-gray-400">Extended Date</dt>
                                <dd className="font-semibold text-gray-800">
                                  {format(
                                    new Date(item.snoozedAt || item.newFollowupDate),
                                    'PPp',
                                  )}
                                </dd>
                              </div>
                            ) : null}
                            <div>
                              <dt className="font-bold uppercase tracking-wide text-gray-400">Assigned User</dt>
                              <dd className="font-semibold text-gray-800">{item.assignedUserName || item.user?.displayName || '—'}</dd>
                            </div>
                            <div>
                              <dt className="font-bold uppercase tracking-wide text-gray-400">Follow-Up Status</dt>
                              <dd className="font-semibold text-gray-800">{item.status}</dd>
                            </div>
                            <div>
                              <dt className="font-bold uppercase tracking-wide text-gray-400">Status</dt>
                              <dd
                                className={`font-bold ${
                                  isLateOverdueStatus(item.overdueStatus) ? 'text-red-600' : 'text-emerald-600'
                                }`}
                              >
                                {overdueStatusLabel(item.overdueStatus)}
                              </dd>
                            </div>
                            <div className="sm:col-span-2">
                              <dt className="font-bold uppercase tracking-wide text-gray-400">Follow-Up Notes</dt>
                              <dd className="font-semibold text-gray-800">{item.followUpNotes || item.description || '—'}</dd>
                            </div>
                          </dl>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenFollowUp?.(item)}
                              className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-black text-white"
                            >
                              Actions
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={() => onOpenLead?.(item)}
                        className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-gray-900">{item.name}</h4>
                          {(item.currentStage || item.stage) ? (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-black"
                              style={stageBadgeStyle((item.currentStage || item.stage)?.color)}
                            >
                              {(item.currentStage || item.stage)?.name}
                            </span>
                          ) : null}
                        </div>
                        <dl className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                          <div>
                            <dt className="font-bold uppercase tracking-wide text-gray-400">Customer</dt>
                            <dd className="font-semibold text-gray-800">{item.customerName || item.email || item.phone || '—'}</dd>
                          </div>
                          <div>
                            <dt className="font-bold uppercase tracking-wide text-gray-400">Previous Stage</dt>
                            <dd className="font-semibold text-gray-800">{item.previousStage?.name || '—'}</dd>
                          </div>
                          <div>
                            <dt className="font-bold uppercase tracking-wide text-gray-400">Current Stage</dt>
                            <dd className="font-semibold text-gray-800">{(item.currentStage || item.stage)?.name || '—'}</dd>
                          </div>
                          <div>
                            <dt className="font-bold uppercase tracking-wide text-gray-400">Date/Time</dt>
                            <dd className="font-semibold text-gray-800">
                              {item.changedAt || item.createdAt
                                ? format(new Date(item.changedAt || item.createdAt), 'PPp')
                                : '—'}
                            </dd>
                          </div>
                        </dl>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                          {item.email && <span>{item.email}</span>}
                          {item.phone && <span>{item.phone}</span>}
                          <WhatsAppActionButton
                            phone={item.phone}
                            variant="inline"
                            stopPropagation
                            requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                            audit={{
                              entityType: 'Lead',
                              entityId: item.id,
                              entityName: item.name,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm font-semibold text-gray-500">No items found.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default CalendarDetailsModal;
