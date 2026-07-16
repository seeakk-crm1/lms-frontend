import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, X, User, PhoneCall, Building2, Calendar, Tag, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { formatFollowUpTypeLabel } from '../../modules/followups/followUpTypeUi';
import type { FollowUp } from '../../types/followup.types';
import WhatsAppActionButton from '../common/WhatsAppActionButton';
import { LEAD_WHATSAPP_PERMISSIONS } from '../../constants/whatsappPermissions';
import { formatPhoneWithFlag } from '../../utils/phoneUtils';

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
              </div>
              <button onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {/* Header Card */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center gap-4">
                  {followUp.lead?.profileImage ? (
                    <img src={followUp.lead.profileImage} alt={followUp.lead.name} className="h-14 w-14 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm">
                      <User className="h-7 w-7" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-base font-black text-gray-900">{followUp.lead?.name || followUp.leadId}</h4>
                    {followUp.lead?.stage && (
                      <span
                        className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
                        style={{ backgroundColor: `${followUp.lead.stage.color}15`, color: followUp.lead.stage.color }}
                      >
                        {followUp.lead.stage.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-200/60 pt-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Customer Name</p>
                    <p className="font-bold text-gray-800">{followUp.lead?.name || followUp.leadId}</p>
                  </div>
                  {followUp.lead?.phone && (
                    <div className="text-right">
                      <p className="text-xs font-semibold text-gray-500">Phone</p>
                      <p className="font-bold text-gray-800">{formatPhoneWithFlag(followUp.lead.phone)}</p>
                    </div>
                  )}
                </div>

                {followUp.lead?.phone && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <a
                      href={`tel:${followUp.lead.phone.replace(/[^0-9+]/g, '')}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <PhoneCall className="h-4 w-4" />
                      Call
                    </a>
                    <WhatsAppActionButton
                      phone={followUp.lead.phone}
                      variant="cta"
                      stopPropagation={false}
                      requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                      title="WhatsApp"
                      audit={{
                        entityType: 'FollowUp',
                        entityId: followUp.id,
                        entityName: followUp.lead?.name || followUp.leadId,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Details Card */}
              <div className="rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><User className="h-3.5 w-3.5" /> Assigned User</p>
                    <p className="mt-0.5 font-bold text-gray-800">{followUp.assignedUserName || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Building2 className="h-3.5 w-3.5" /> Office</p>
                    <p className="mt-0.5 font-bold text-gray-800">{followUp.officeName || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Calendar className="h-3.5 w-3.5" /> Scheduled Time</p>
                    <p className="mt-0.5 font-bold text-gray-800">{format(new Date(followUp.scheduledAt), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Tag className="h-3.5 w-3.5" /> Follow-up Type</p>
                    <p className="mt-0.5 font-bold text-gray-800">{typeLabel}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><AlertCircle className="h-3.5 w-3.5" /> Status</p>
                    <p className="mt-0.5 font-bold text-gray-800 capitalize">{followUp.status.toLowerCase()}</p>
                  </div>
                  {followUp.priority && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">Priority</p>
                      <p className="mt-0.5 font-bold text-gray-800">{followUp.priority}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <FileText className="h-3.5 w-3.5" /> Latest Follow-up Note
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-gray-700 whitespace-pre-wrap">
                    {followUp.recentDescription || followUp.description || 'No notes available'}
                  </p>
                </div>
              </div>

              <div className={isCompleted ? 'flex flex-col gap-3' : 'grid gap-3 sm:grid-cols-2'}>
                {!isCompleted ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onMarkCompleted(followUp)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Follow-up
                    </button>
                    <button
                      type="button"
                      onClick={() => onSnooze(followUp)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-white hover:bg-amber-600"
                    >
                      <Clock3 className="h-4 w-4" />
                      Extend Follow-up
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default React.memo(FollowUpActionModal);
