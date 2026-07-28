import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, X, PhoneCall, Building2, Calendar, Tag, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { formatFollowUpTypeLabel } from '../../modules/followups/followUpTypeUi';
import type { FollowUp } from '../../types/followup.types';
import WhatsAppActionButton from '../common/WhatsAppActionButton';
import { LEAD_WHATSAPP_PERMISSIONS } from '../../constants/whatsappPermissions';
import { formatPhoneWithFlag } from '../../utils/phoneUtils';
import LeadAvatar from '../../pages/leads/components/LeadAvatar';
import FollowUpContextCard from './FollowUpContextCard';
import { useFollowupWorkflowStore } from '../../store/followupWorkflowStore';

interface Props {
  isOpen: boolean;
  followUp: any; // Using any to accept both FollowUp and FollowUpReminderItem safely
  onClose: () => void;
  onOpenLead: (followUp: any) => void;
  onMarkCompleted: (followUp: any) => void;
  onSnooze: (followUp: any) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'EXTENDED':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'OVERDUE':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const FollowUpActionModal: React.FC<Props> = ({ isOpen, followUp, onClose, onOpenLead, onMarkCompleted, onSnooze }) => {
  const isEditingFromFollowup = useFollowupWorkflowStore((state) => state.isEditingFromFollowup);
  const typeLabel = useMemo(() => (followUp ? formatFollowUpTypeLabel(followUp.type) : ''), [followUp]);
  const isCompleted = followUp?.status === 'COMPLETED';

  if (!isOpen || !followUp || isEditingFromFollowup) return null;

  // Extract fields whether it's FollowUp or FollowUpReminderItem
  const leadId = followUp.lead?.id || followUp.leadId;
  const leadName = followUp.lead?.name || followUp.leadName || 'Unknown Lead';
  const leadEmail = followUp.lead?.email || followUp.leadEmail;
  const leadCompany = followUp.lead?.companyName || followUp.leadCompanyName;
  const leadPhone = followUp.lead?.phone || followUp.leadPhone;
  const leadImage =
    followUp.lead?.profileImageUrl ||
    followUp.lead?.profileImage ||
    followUp.lead?.avatarUrl ||
    followUp.lead?.image ||
    followUp.profileImageUrl ||
    followUp.leadProfileImage ||
    followUp.image;
  const stageName = followUp.lead?.stage?.name || followUp.leadStage?.name;
  const stageColor = followUp.lead?.stage?.color || followUp.leadStage?.color || '#6b7280';
  
  const assignedUserName = followUp.assignedUserName || followUp.lead?.assignedTo?.name || 'Unassigned';
  const officeName = followUp.officeName || followUp.user?.office?.name || 'Not available';
  
  const originalDate = followUp.originalScheduledDate || followUp.previousFollowupDate || followUp.scheduledAt;
  const extendedDate = followUp.extendedDate || followUp.newFollowupDate;
  
  const latestNote = followUp.latestFollowupNote || followUp.recentDescription || followUp.description || 'No notes available';

  return (
    <AnimatePresence>
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
          className="relative w-full max-w-[600px] flex flex-col max-h-[90vh] rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-white px-5 py-4 shrink-0 z-10 sticky top-0">
            <div>
              <h3 className="text-lg font-black text-gray-900">Follow-up Reminder</h3>
            </div>
            <button onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-y-auto overflow-x-hidden p-5 flex-1 space-y-5 bg-gray-50/50">
            {/* Lead Profile Header Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <LeadAvatar name={leadName} imageUrl={leadImage} className="h-16 w-16" textClassName="text-xl" />
                  <div>
                    <h4 className="text-xl font-black text-gray-900">{leadName}</h4>
                    {stageName && (
                      <span
                        className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide"
                        style={{ backgroundColor: `${stageColor}15`, color: stageColor, border: `1px solid ${stageColor}30` }}
                      >
                        {stageName}
                      </span>
                    )}
                  </div>
                </div>
                
                {leadPhone ? (
                  <div className="flex flex-col sm:items-end w-full sm:w-auto">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Phone Number</p>
                    <p className="text-lg font-black text-gray-800 tracking-tight">{formatPhoneWithFlag(leadPhone)}</p>
                    <div className="mt-3 flex items-center gap-2 w-full">
                      <a
                        href={`tel:${leadPhone.replace(/[^0-9+]/g, '')}`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors ring-1 ring-blue-100"
                      >
                        <PhoneCall className="h-4 w-4" />
                        Call
                      </a>
                      <div className="flex-1 sm:flex-none *:w-full *:justify-center *:rounded-full">
                        <WhatsAppActionButton
                          phone={leadPhone}
                          variant="cta"
                          stopPropagation={false}
                          requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                          title="WhatsApp"
                          audit={{
                            entityType: 'FollowUp',
                            entityId: followUp.id,
                            entityName: leadName,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-500">Phone Number</p>
                    <p className="font-bold text-gray-400 italic">No Phone Number</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h5 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">Customer Information</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500">Customer Name</p>
                  <p className="mt-1 font-bold text-gray-800">{leadName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Company Name</p>
                  <p className="mt-1 font-bold text-gray-800">{leadCompany || '-'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">Email</p>
                  <p className="mt-1 font-bold text-gray-800 truncate" title={leadEmail || ''}>{leadEmail || '-'}</p>
                </div>
              </div>
            </div>

            {/* Follow-up Details Grid */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h5 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Follow-up Details</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                <div className="flex items-center gap-3">
                  <LeadAvatar name={assignedUserName} className="h-9 w-9" textClassName="text-sm" />
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Assigned User</p>
                    <p className="font-bold text-gray-800">{assignedUserName}</p>
                  </div>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Building2 className="h-3.5 w-3.5" /> Office</p>
                  <p className="mt-1 font-bold text-gray-800">{officeName}</p>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Tag className="h-3.5 w-3.5" /> Type</p>
                  <p className="mt-1 font-bold text-gray-800">{typeLabel}</p>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><AlertCircle className="h-3.5 w-3.5" /> Status</p>
                  <span className={`mt-1 inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase border ${getStatusColor(followUp.status)}`}>
                    {followUp.status}
                  </span>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Calendar className="h-3.5 w-3.5" /> Scheduled Time</p>
                  <p className="mt-1 font-bold text-gray-800">{format(new Date(followUp.scheduledAt), 'dd MMM yyyy, hh:mm a')}</p>
                </div>

                {extendedDate ? (
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500"><Clock3 className="h-3.5 w-3.5" /> Original Date</p>
                    <p className="mt-1 font-bold text-gray-500 line-through decoration-gray-400">{format(new Date(originalDate), 'dd MMM yyyy, hh:mm a')}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 border-t border-gray-100 pt-5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                  <FileText className="h-3.5 w-3.5" /> Latest Follow-up Note
                </p>
                <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {latestNote}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 mt-2 mb-4">
              <FollowUpContextCard leadId={leadId} />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="shrink-0 border-t border-gray-200 bg-white px-5 py-4 sticky bottom-0 z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  useFollowupWorkflowStore.getState().openLeadFromFollowup(followUp, 'CALENDAR');
                  onOpenLead(followUp);
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                Open Lead
              </button>
              
              {!isCompleted ? (
                <>
                  <button
                    type="button"
                    onClick={() => onSnooze(followUp)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600 transition-colors shadow-sm shadow-amber-500/20"
                  >
                    <Clock3 className="h-4 w-4" />
                    Extend
                  </button>
                  <button
                    type="button"
                    onClick={() => onMarkCompleted(followUp)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Complete
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default React.memo(FollowUpActionModal);
