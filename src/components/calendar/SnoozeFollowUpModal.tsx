import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { FollowUp } from '../../types/followup.types';
import { useActiveExtensionReasonsQuery } from '../../modules/followup-extension-reasons/hooks/useFollowUpExtensionReasons';
import { useLifecycleExtensionLimit } from '../../hooks/useLifecycleExtensionLimit';
import {
  lifecycleExtensionHint,
  maxDateTimeLocalFromLifecycleLimit,
} from '../../modules/followups/followupLifecycleUi';

interface Props {
  isOpen: boolean;
  followUp: FollowUp | null;
  value: string;
  onChange: (value: string) => void;
  recentDescription: string;
  onRecentDescriptionChange: (value: string) => void;
  selectedReasonId: string;
  onSelectedReasonIdChange: (value: string) => void;
  reminderActionType: 'SNOOZE' | 'REMIND_LATER';
  onReminderActionTypeChange: (value: 'SNOOZE' | 'REMIND_LATER') => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  /** Renders above mandatory overdue gate (z-index 9998). */
  stackAboveMandatoryGate?: boolean;
}

const SnoozeFollowUpModal: React.FC<Props> = ({
  isOpen,
  followUp,
  value,
  onChange,
  recentDescription,
  onRecentDescriptionChange,
  selectedReasonId,
  onSelectedReasonIdChange,
  reminderActionType,
  onReminderActionTypeChange,
  onClose,
  onSubmit,
  isSubmitting = false,
  stackAboveMandatoryGate = false,
}) => {
  const layerZ = stackAboveMandatoryGate ? 'z-[10050]' : 'z-[170]';
  const { data: activeReasons = [] } = useActiveExtensionReasonsQuery(isOpen);
  const lifecycleQuery = useLifecycleExtensionLimit(followUp?.leadId, isOpen && Boolean(followUp?.leadId));
  const lifecycle = lifecycleQuery.data?.data;

  const minDateTime = useMemo(() => {
    const next = new Date();
    next.setMinutes(next.getMinutes() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`;
  }, [followUp?.id, isOpen]);

  const maxDateTime = useMemo(
    () =>
      lifecycle?.applies && !lifecycle.canOverride
        ? maxDateTimeLocalFromLifecycleLimit(lifecycle.maxExtensionDate)
        : undefined,
    [lifecycle],
  );

  const lifecycleHint = useMemo(
    () =>
      lifecycle?.applies
        ? lifecycleExtensionHint({
            applies: true,
            remainingDays: lifecycle.remainingDays,
            maxFollowUpDate: lifecycle.maxExtensionDate?.slice(0, 10) ?? null,
            canOverride: lifecycle.canOverride,
          })
        : null,
    [lifecycle],
  );

  const lifecycleBlocked =
    Boolean(lifecycle?.applies && !lifecycle?.canOverride && lifecycle.remainingDays === 0);

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'PPp');
    } catch {
      return new Date(dateStr).toLocaleString();
    }
  };

  const hasAnyInput = selectedReasonId || recentDescription.trim();

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className={`fixed inset-0 ${layerZ} flex items-end justify-center p-0 sm:items-center sm:p-4`}>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
            aria-label="Close snooze modal"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative w-full max-w-md rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-black text-gray-900">Snooze Follow-up</h3>
              <button onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Current Follow-Up Date
                </label>
                <div className="mt-1 text-sm font-semibold text-gray-700 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                  {formatDateTime(followUp?.scheduledAt)}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Action Type
                </label>
                <div className="mt-1.5 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                    <input
                      type="radio"
                      name="reminderActionType"
                      value="SNOOZE"
                      checked={reminderActionType === 'SNOOZE'}
                      onChange={() => onReminderActionTypeChange('SNOOZE')}
                      className="h-4 w-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                    />
                    Snooze
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                    <input
                      type="radio"
                      name="reminderActionType"
                      value="REMIND_LATER"
                      checked={reminderActionType === 'REMIND_LATER'}
                      onChange={() => onReminderActionTypeChange('REMIND_LATER')}
                      className="h-4 w-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                    />
                    Remind Later
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  New Follow-Up Date
                </label>
                <input
                  type="datetime-local"
                  value={value}
                  min={minDateTime}
                  max={maxDateTime}
                  onChange={(event) => onChange(event.target.value)}
                  disabled={lifecycleBlocked}
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
                {lifecycleHint ? (
                  <p
                    className={`mt-1.5 text-[11px] font-semibold leading-relaxed ${
                      lifecycleBlocked ? 'text-rose-600' : 'text-amber-700'
                    }`}
                  >
                    {lifecycleHint}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Follow-Up Extension Reason
                </label>
                <select
                  value={selectedReasonId}
                  onChange={(event) => onSelectedReasonIdChange(event.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Select Predefined Reason --</option>
                  {activeReasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.reasonName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Recent Follow-Up Description
                </label>
                <textarea
                  value={recentDescription}
                  onChange={(event) => onRecentDescriptionChange(event.target.value)}
                  rows={4}
                  placeholder="Record outcome before snoozing (e.g., 'Client asked to call next week')"
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 resize-y"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting || !value || !hasAnyInput || lifecycleBlocked}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default React.memo(SnoozeFollowUpModal);
