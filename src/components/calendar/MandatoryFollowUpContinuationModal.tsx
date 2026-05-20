import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock, Loader2 } from 'lucide-react';
import { formatFollowUpTypeLabel } from '../../modules/followups/followUpTypeUi';
import type { MandatoryFollowUpContinuationItem } from '../../types/mandatoryFollowup.types';
import type { FollowUpType } from '../../types/followup.types';

const FOLLOW_UP_TYPES: FollowUpType[] = ['CALL', 'VISIT', 'MEETING'];

const formatDisplayDate = (value: string | null): string => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const toDateInputValue = (iso: string | null): string => {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
};

const toIsoFromLocalInput = (value: string): string => {
  const parsed = new Date(value);
  return parsed.toISOString();
};

interface Props {
  item: MandatoryFollowUpContinuationItem;
  queuePosition: number;
  queueTotal: number;
  isSubmitting: boolean;
  onSubmit: (payload: { scheduledAt: string; type: FollowUpType; description: string }) => Promise<void>;
}

const MandatoryFollowUpContinuationModal: React.FC<Props> = ({
  item,
  queuePosition,
  queueTotal,
  isSubmitting,
  onSubmit,
}) => {
  const minDateTime = useMemo(() => {
    const next = new Date();
    next.setMinutes(next.getMinutes() + 5);
    return toDateInputValue(next.toISOString());
  }, [item.leadId]);

  const maxDateTime = useMemo(() => {
    if (!item.maxFollowUpDate) return undefined;
    const end = new Date(`${item.maxFollowUpDate}T23:59:59`);
    return toDateInputValue(end.toISOString());
  }, [item.maxFollowUpDate]);

  const [scheduledAt, setScheduledAt] = useState(minDateTime);
  const [type, setType] = useState<FollowUpType>(item.previousFollowUpType || 'CALL');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setScheduledAt(minDateTime);
    setType(item.previousFollowUpType || 'CALL');
    setNotes('');
  }, [item.leadId, item.previousFollowUpType, minDateTime]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mandatory-followup-title"
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_40px_120px_-45px_rgba(15,23,42,0.55)]"
        >
          <div className="border-b border-gray-100 bg-gradient-to-r from-amber-50 via-white to-emerald-50 px-6 py-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">
              <CalendarClock className="h-3.5 w-3.5" />
              Mandatory Follow-up
            </div>
            <h2 id="mandatory-followup-title" className="mt-3 text-2xl font-black text-gray-900">
              Schedule Next Follow-up
            </h2>
            <p className="mt-2 text-sm font-semibold text-gray-600">
              This lifecycle lead requires a future follow-up before you can continue using the application.
              {queueTotal > 1 ? ` (${queuePosition} of ${queueTotal})` : ''}
            </p>
          </div>

          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Lead Name</p>
              <p className="mt-1 text-sm font-black text-gray-900">{item.leadName}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Customer</p>
              <p className="mt-1 text-sm font-black text-gray-900">{item.customerName}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Current Stage</p>
              <p className="mt-1 text-sm font-black text-gray-900">{item.stageName}</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Lifecycle Remaining</p>
              <p className="mt-1 text-sm font-black text-gray-900">
                {item.lifecycleRemainingDays !== null ? `${item.lifecycleRemainingDays} day(s)` : '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:col-span-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Previous Follow-up</p>
              <p className="mt-1 text-sm font-semibold text-gray-700">
                {item.previousFollowUpType
                  ? `${formatFollowUpTypeLabel(item.previousFollowUpType)} · ${formatDisplayDate(item.previousFollowUpDate)}`
                  : 'No prior follow-up recorded'}
              </p>
              {item.previousFollowUpNotes ? (
                <p className="mt-2 text-sm font-medium text-gray-600">{item.previousFollowUpNotes}</p>
              ) : null}
              {item.overdueDays > 0 ? (
                <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                  Overdue by {item.overdueDays} day(s)
                </p>
              ) : null}
            </div>
          </div>

          <form
            className="space-y-4 border-t border-gray-100 px-6 py-5"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!scheduledAt.trim()) return;
              await onSubmit({
                scheduledAt: toIsoFromLocalInput(scheduledAt),
                type,
                description: notes.trim(),
              });
            }}
          >
            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                Next Follow-up Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                min={minDateTime}
                max={maxDateTime}
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              {item.maxFollowUpDate ? (
                <p className="mt-1.5 text-xs font-semibold text-gray-500">
                  Latest allowed date: {item.maxFollowUpDate}
                </p>
              ) : null}
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Follow-up Type</label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as FollowUpType)}
                className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {FOLLOW_UP_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {formatFollowUpTypeLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Notes</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add context for the next touchpoint..."
                className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !scheduledAt}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.85)] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save &amp; Continue
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MandatoryFollowUpContinuationModal;
