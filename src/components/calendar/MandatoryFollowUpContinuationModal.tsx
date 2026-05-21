import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Loader2, User, Phone, CheckCircle, Flame, MessageSquare, Clipboard } from 'lucide-react';
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
  const panelRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    panelRef.current?.focus();
  }, [item.leadId]);

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto flex items-start md:items-center justify-center p-4 md:p-6 bg-slate-950/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mandatory-followup-title"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="fixed inset-0 bg-transparent"
        aria-hidden
        onMouseDown={(event) => event.preventDefault()}
      />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-xl my-8 bg-white rounded-3xl border border-gray-100 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.08)] outline-none overflow-hidden"
      >
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-6 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CalendarClock size={160} />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-sm">
              <CalendarClock size={12} />
              Required Action
            </span>
            {queueTotal > 1 && (
              <span className="text-[10px] font-bold opacity-80">
                Queue: {queuePosition} of {queueTotal}
              </span>
            )}
          </div>
          
          <h2 id="mandatory-followup-title" className="mt-3 text-xl md:text-2xl font-black tracking-tight">
            Schedule Next Follow-up
          </h2>
          <p className="mt-1 text-xs text-emerald-100/90 font-medium">
            This active lifecycle lead requires a future follow-up before you can continue using the application.
          </p>
        </div>

        {/* Lead Context Cards Grid */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3.5 flex items-start gap-2.5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl mt-0.5">
                <User size={14} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Lead Name</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5 truncate max-w-[150px]">{item.leadName}</p>
              </div>
            </div>

            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3.5 flex items-start gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                <Phone size={14} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Customer</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5 truncate max-w-[150px]">{item.customerName}</p>
              </div>
            </div>

            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3.5 flex items-start gap-2.5">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl mt-0.5">
                <CheckCircle size={14} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Current Stage</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">{item.stageName}</p>
              </div>
            </div>

            <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-3.5 flex items-start gap-2.5">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl mt-0.5">
                <Flame size={14} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Remaining Time</p>
                <p className="text-xs font-bold text-gray-800 mt-0.5">
                  {item.lifecycleRemainingDays !== null ? `${item.lifecycleRemainingDays} day(s)` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Previous Follow-up details */}
          <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 space-y-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clipboard size={12} />
              Previous Follow-up context
            </p>
            <p className="text-xs font-bold text-gray-700">
              {item.previousFollowUpType
                ? `${formatFollowUpTypeLabel(item.previousFollowUpType)} · ${formatDisplayDate(item.previousFollowUpDate)}`
                : 'No prior follow-up recorded'}
            </p>
            {item.previousFollowUpNotes && (
              <p className="text-xs text-gray-500 italic bg-white/50 border border-gray-50 rounded-xl p-2.5 mt-1 font-medium">
                "{item.previousFollowUpNotes}"
              </p>
            )}
            {item.overdueDays > 0 && (
              <div className="inline-block mt-2 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100">
                Overdue by {item.overdueDays} day(s)
              </div>
            )}
          </div>

          {/* Interactive Form */}
          <form
            className="space-y-4 pt-4 border-t border-gray-100"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!scheduledAt.trim() || isSubmitting) return;
              await onSubmit({
                scheduledAt: toIsoFromLocalInput(scheduledAt),
                type,
                description: notes.trim(),
              });
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Next Follow-up Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  min={minDateTime}
                  max={maxDateTime}
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                />
                {item.maxFollowUpDate && (
                  <span className="text-[10px] text-gray-400 block mt-1 font-medium">
                    Latest Allowed: {item.maxFollowUpDate}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Follow-up Type</label>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as FollowUpType)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white"
                >
                  {FOLLOW_UP_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {formatFollowUpTypeLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Enter context/agenda for this client contact..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/30 px-3 py-2.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !scheduledAt}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3.5 text-xs font-extrabold text-white shadow-md active:scale-98 transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving details...</span>
                </>
              ) : (
                <span>Schedule &amp; Continue</span>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default MandatoryFollowUpContinuationModal;
