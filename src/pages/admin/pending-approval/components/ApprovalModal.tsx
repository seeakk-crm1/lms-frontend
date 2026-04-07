import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, History, ShieldAlert, X } from 'lucide-react';
import type { LeadApprovalAction, LeadApprovalListItem } from '../../../../types/lead.types';
import StatusBadge from './StatusBadge';

interface ApprovalModalProps {
  approval: LeadApprovalListItem | null;
  isSubmitting: boolean;
  canAct: boolean;
  onClose: () => void;
  onSubmit: (payload: { action: LeadApprovalAction; comment: string }) => Promise<void> | void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({ approval, isSubmitting, canAct, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setComment(approval?.comment || '');
    setTouched(false);
  }, [approval]);

  const isOpen = Boolean(approval);
  const isPending = approval?.status === 'PENDING';
  const showActionButtons = Boolean(isPending && canAct);
  const hasError = touched && comment.trim().length === 0;

  if (!approval) {
    return null;
  }

  const handleAction = async (action: LeadApprovalAction) => {
    setTouched(true);
    if (!comment.trim()) return;
    await onSubmit({ action, comment: comment.trim() });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 18 }}
            className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-approval-modal-title"
          >
            <div className="border-b border-gray-100 p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Lead Stage Approval</p>
                    <h2 id="lead-approval-modal-title" className="text-2xl font-black tracking-tight text-gray-900">
                      Lead Stage Approval Required
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close approval modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Lead</div>
                  <div className="mt-2 text-lg font-black text-gray-900">{approval.lead?.name || 'Unknown lead'}</div>
                  <div className="mt-1 text-sm font-semibold text-gray-500">
                    {approval.lead?.email || approval.lead?.phone || 'No contact details'}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Status</div>
                  <div className="mt-3">
                    <StatusBadge status={approval.status} />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-gray-500">
                    Requested by {approval.requestedBy?.displayName || approval.requestedBy?.name || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 md:grid-cols-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">From Stage</div>
                  <div className="mt-2 text-sm font-black text-gray-900">{approval.fromStage?.name || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">To Stage</div>
                  <div className="mt-2 text-sm font-black text-gray-900">{approval.toStage?.name || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Approver</div>
                  <div className="mt-2 text-sm font-black text-gray-900">
                    {approval.assignedTo?.displayName || approval.assignedTo?.name || 'Open queue'}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>Requested At</span>
                  </div>
                  <div className="mt-2 text-sm font-black text-gray-900">{new Date(approval.createdAt).toLocaleString()}</div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                    <History className="h-3.5 w-3.5" />
                    <span>Last Updated</span>
                  </div>
                  <div className="mt-2 text-sm font-black text-gray-900">{new Date(approval.updatedAt).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                  Add Comment
                </label>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="Explain the business reason behind this approval decision."
                  className={`min-h-[140px] w-full rounded-3xl border bg-gray-50 px-4 py-4 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 ${
                    hasError ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                  }`}
                  aria-invalid={hasError}
                />
                {hasError ? (
                  <p className="mt-2 text-sm font-bold text-rose-500">A decision comment is required.</p>
                ) : null}
                {!showActionButtons && approval.comment ? (
                  <p className="mt-2 text-sm font-semibold text-gray-500">This record has already been processed.</p>
                ) : null}
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
                <p className="text-[11px] font-bold leading-normal text-slate-600">
                  Comments are mandatory so the approval decision remains traceable in audit logs and lead activity history.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-sm font-black text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showActionButtons ? 'Cancel' : 'Close'}
                </button>

                {showActionButtons ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction('DENY')}
                      disabled={isSubmitting}
                      className="flex flex-1 items-center justify-center rounded-2xl bg-rose-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-rose-300"
                    >
                      {isSubmitting ? 'Processing…' : 'Deny'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('APPROVE')}
                      disabled={isSubmitting}
                      className="flex flex-[1.2] items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      {isSubmitting ? 'Processing…' : 'Approve'}
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

export default ApprovalModal;
