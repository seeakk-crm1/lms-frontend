import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, CheckCircle2, Clock3, X } from 'lucide-react';
import { format } from 'date-fns';
import { formatFollowUpTypeLabel } from '../../modules/followups/followUpTypeUi';
import type { FollowUp } from '../../types/followup.types';
import WhatsAppActionButton from '../common/WhatsAppActionButton';
import { LEAD_WHATSAPP_PERMISSIONS } from '../../constants/whatsappPermissions';

interface Props {
  isOpen: boolean;
  followUp: FollowUp | null;
  onClose: () => void;
  onOpenLead: (followUp: FollowUp) => void;
  onMarkCompleted: (followUp: FollowUp) => void;
  onSnooze: (followUp: FollowUp) => void;
}

const FollowUpActionModal: React.FC<Props> = ({ isOpen, followUp, onClose, onOpenLead, onMarkCompleted, onSnooze }) => {
  const typeLabel = useMemo(() => (followUp ? formatFollowUpTypeLabel(followUp.type) : ''), [followUp]);
  const isCompleted = followUp?.status === 'COMPLETED';

  return (
    <AnimatePresence>
      {isOpen && followUp ? (
        <div className="fixed inset-0 z-[160] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
            aria-label="Close follow-up actions"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative w-full max-w-xl rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">Follow-up Reminder</h3>
                <p className="mt-1 text-xs font-semibold text-gray-500">
                  {typeLabel} · {format(new Date(followUp.scheduledAt), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
              <button onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-red-500">Lead</p>
                <p className="mt-1 text-sm font-black text-gray-900">{followUp.lead?.name || followUp.leadId}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-gray-600">
                    {followUp.lead?.email || followUp.lead?.phone || 'No contact info'}
                  </p>
                  <WhatsAppActionButton
                    phone={followUp.lead?.phone}
                    variant="compact"
                    stopPropagation={false}
                    requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                    title="Open WhatsApp"
                    audit={{
                      entityType: 'FollowUp',
                      entityId: followUp.id,
                      entityName: followUp.lead?.name || followUp.leadId,
                    }}
                  />
                </div>
                <p className="mt-3 text-xs font-black uppercase tracking-widest text-red-500">Follow-up type</p>
                <p className="mt-1 text-sm font-black text-gray-800">{typeLabel}</p>
                <p className="mt-3 text-xs font-black uppercase tracking-widest text-red-500">Follow-up Note</p>
                <p className="mt-1 text-sm font-semibold text-gray-700">{followUp.description || 'No description provided'}</p>
                {followUp.extensionReasonName ? (
                  <>
                    <p className="mt-3 text-xs font-black uppercase tracking-widest text-red-500">Latest Reason</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800 whitespace-pre-wrap">{followUp.extensionReasonName}</p>
                  </>
                ) : null}
                {followUp.recentDescription ? (
                  <>
                    <p className="mt-3 text-xs font-black uppercase tracking-widest text-red-500">Latest Outcome</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800 whitespace-pre-wrap">{followUp.recentDescription}</p>
                  </>
                ) : null}
                {isCompleted && followUp.completionDescription ? (
                  <>
                    <p className="mt-3 text-xs font-black uppercase tracking-widest text-red-500">Completion notes</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800 whitespace-pre-wrap">{followUp.completionDescription}</p>
                  </>
                ) : null}
                {followUp.activityLogs && followUp.activityLogs.length > 0 ? (
                  <>
                    <p className="mt-3 text-xs font-black uppercase tracking-widest text-red-500">Snooze History</p>
                    <div className="mt-1.5 space-y-2 max-h-40 overflow-y-auto pr-1">
                      {followUp.activityLogs.map((log: any) => {
                        const actionLabel = log.reminderActionType === 'REMIND_LATER' ? 'Reminded Later' : 'Snoozed';
                        return (
                          <div key={log.id} className="rounded-lg bg-gray-100/70 p-2 text-xs text-gray-600 border border-gray-200/50">
                            <div className="flex justify-between font-bold text-gray-800 mb-0.5">
                              <span>{actionLabel}</span>
                              <span className="font-semibold text-gray-400">
                                {format(new Date(log.snoozedAt), 'dd MMM yyyy, hh:mm a')}
                              </span>
                            </div>
                            {log.extensionReasonName ? (
                              <p className="mt-0.5"><span className="font-semibold text-gray-700">Reason:</span> {log.extensionReasonName}</p>
                            ) : null}
                            {log.recentDescription ? (
                              <p className="mt-0.5"><span className="font-semibold text-gray-700">Outcome:</span> {log.recentDescription}</p>
                            ) : null}
                            <p className="text-[10px] text-gray-500 mt-0.5">
                              Moved from: {format(new Date(log.previousFollowupDate), 'dd MMM, hh:mm a')} to: {format(new Date(log.newFollowupDate), 'dd MMM, hh:mm a')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </div>

              <div className={isCompleted ? 'flex flex-col gap-3' : 'grid gap-3 sm:grid-cols-2'}>
                <WhatsAppActionButton
                  phone={followUp.lead?.phone}
                  variant="cta"
                  stopPropagation={false}
                  requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                  title="Chat on WhatsApp"
                  audit={{
                    entityType: 'FollowUp',
                    entityId: followUp.id,
                    entityName: followUp.lead?.name || followUp.leadId,
                  }}
                />
                <button
                  type="button"
                  onClick={() => onOpenLead(followUp)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Lead
                </button>
                {!isCompleted ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onMarkCompleted(followUp)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => onSnooze(followUp)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-white hover:bg-amber-600"
                    >
                      <Clock3 className="h-4 w-4" />
                      Snooze / Remind Later
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-500 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default React.memo(FollowUpActionModal);
