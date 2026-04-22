import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, History, ShieldAlert, X } from 'lucide-react';
import type { LeadApprovalAction, LeadApprovalListItem } from '../../../../types/lead.types';
import StatusBadge from './StatusBadge';

interface ApprovalModalProps {
  approval: LeadApprovalListItem | null;
  isSubmitting: boolean;
  canAct: boolean;
  canApprove: boolean;
  canDeny: boolean;
  onClose: () => void;
  onSubmit: (payload: { action: LeadApprovalAction; comment: string }) => Promise<void> | void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  approval,
  isSubmitting,
  canAct,
  canApprove,
  canDeny,
  onClose,
  onSubmit,
}) => {
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

  const stageRuleEntries =
    approval.requestData &&
    typeof approval.requestData === 'object' &&
    !Array.isArray(approval.requestData) &&
    Array.isArray((approval.requestData as Record<string, unknown>).stageRuleValues)
      ? ((approval.requestData as Record<string, unknown>).stageRuleValues as Array<{
          ruleName?: string;
          ruleId?: string;
          value?: string;
        }>)
      : [];

  const handleAction = async (action: LeadApprovalAction) => {
    setTouched(true);
    if (!comment.trim()) return;
    await onSubmit({ action, comment: comment.trim() });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[150] flex items-end justify-center bg-gray-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 18 }}
            className="flex h-full w-full flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-[32px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-approval-modal-title"
          >
            <div className="border-b border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 sm:h-12 sm:w-12">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Lead Stage Approval</p>
                    <h2 id="lead-approval-modal-title" className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
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

              <div className="mt-5 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:grid-cols-2 md:grid-cols-3">
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

              {stageRuleEntries.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-800">Submitted stage data</div>
                  <ul className="mt-3 space-y-2">
                    {stageRuleEntries.map((entry, index) => (
                      <li key={`${entry.ruleId || index}`} className="text-sm text-gray-900">
                        <span className="font-black text-gray-800">{entry.ruleName || entry.ruleId || 'Field'}:</span>{' '}
                        <span className="font-semibold text-gray-700">{entry.value ?? '—'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:space-y-6 sm:p-6 lg:p-8">
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
                  className="order-3 flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 sm:order-1 sm:border-transparent sm:bg-transparent sm:px-0"
                >
                  {showActionButtons ? 'Cancel' : 'Close'}
                </button>

                {showActionButtons ? (
                  <>
                    {canDeny ? (
                      <button
                        type="button"
                        onClick={() => handleAction('DENY')}
                        disabled={isSubmitting}
                        className="order-1 flex w-full items-center justify-center rounded-2xl bg-rose-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-rose-300 sm:order-2 sm:flex-1"
                      >
                        {isSubmitting ? 'Processing…' : 'Deny'}
                      </button>
                    ) : null}
                    {canApprove ? (
                      <button
                        type="button"
                        onClick={() => handleAction('APPROVE')}
                        disabled={isSubmitting}
                        className="order-2 flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-emerald-300 sm:order-3 sm:flex-[1.2]"
                      >
                        {isSubmitting ? 'Processing…' : 'Approve'}
                      </button>
                    ) : null}
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
