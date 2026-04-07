import React, { memo, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlarmClock, AlertTriangle, ArrowRightCircle } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type { LeadListItem } from '../../../types/lead.types';

interface LeadSlaDecisionModalProps {
  isOpen: boolean;
  lead: LeadListItem | null;
  isSubmitting?: boolean;
  lobReasonOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onExtend: (extraDays: number) => void;
  onMoveToLob: (payload: { reasonId: string; remarks: string }) => void;
}

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const LeadSlaDecisionModal: React.FC<LeadSlaDecisionModalProps> = ({
  isOpen,
  lead,
  isSubmitting = false,
  lobReasonOptions,
  onClose,
  onExtend,
  onMoveToLob,
}) => {
  const [extraDays, setExtraDays] = useState('1');
  const [reasonId, setReasonId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setExtraDays('1');
    setReasonId('');
    setRemarks('');
    setError('');
  }, [isOpen, lead?.id]);

  const expiryText = lead?.stageExpiresAt
    ? new Date(lead.stageExpiresAt).toLocaleString()
    : 'the configured deadline';

  const handleExtend = () => {
    const parsed = Number(extraDays);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter a valid number of days to extend this lead.');
      return;
    }

    setError('');
    onExtend(parsed);
  };

  const handleMoveToLob = () => {
    if (!reasonId.trim() || !remarks.trim()) {
      setError('LOB reason and remarks are required before moving this lead to LOB.');
      return;
    }

    setError('');
    onMoveToLob({
      reasonId: reasonId.trim(),
      remarks: remarks.trim(),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && lead ? (
        <div className="fixed inset-0 z-[135] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            aria-label="Close lifecycle SLA modal"
          />

          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            className="relative w-full max-w-2xl rounded-t-3xl border border-slate-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="mb-2 flex items-center gap-2 text-amber-600">
                <AlarmClock className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-[0.28em]">Lifecycle Warning</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">{lead.name} needs a lifecycle decision</h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                This lead will hit its lifecycle deadline on {expiryText}. Extend the timer if work is still active, or move it to LOB now. If no action is taken before the deadline, the system will move it to LOB automatically.
              </p>
            </div>

            <div className="grid gap-5 px-5 py-5 sm:px-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-emerald-700">
                  <AlarmClock className="h-4 w-4" />
                  <h4 className="text-sm font-black">Extend Lead Timer</h4>
                </div>
                <p className="text-sm font-semibold text-emerald-800/80">
                  Add extra days when the opportunity is still active and the team needs more time.
                </p>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-black text-slate-900">Extra Days</label>
                  <input
                    type="number"
                    min={1}
                    value={extraDays}
                    onChange={(event) => setExtraDays(event.target.value)}
                    className={inputClassName}
                    placeholder="1"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleExtend}
                  disabled={isSubmitting}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  {isSubmitting ? 'Updating…' : 'Extend Lead'}
                </button>
              </section>

              <section className="rounded-3xl border border-rose-100 bg-rose-50/70 p-4">
                <div className="mb-3 flex items-center gap-2 text-rose-700">
                  <AlertTriangle className="h-4 w-4" />
                  <h4 className="text-sm font-black">Move to LOB</h4>
                </div>
                <p className="text-sm font-semibold text-rose-800/80">
                  Use this when the opportunity should exit the active pipeline and be tracked as loss of business.
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-900">LOB Reason</label>
                    <SearchableSelect
                      options={lobReasonOptions}
                      value={reasonId}
                      onChange={(event) => setReasonId(event.target.value)}
                      placeholder={lobReasonOptions.length ? 'Select LOB reason' : 'No active LOB reasons'}
                      name="reasonId"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-900">Remarks</label>
                    <textarea
                      rows={4}
                      value={remarks}
                      onChange={(event) => setRemarks(event.target.value)}
                      className={`${inputClassName} resize-none`}
                      placeholder="Explain why the lead should move to LOB"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleMoveToLob}
                  disabled={isSubmitting}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {isSubmitting ? 'Updating…' : 'Move to LOB'}
                </button>
              </section>
            </div>

            <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
              {error ? <p className="mb-3 text-sm font-bold text-rose-600">{error}</p> : null}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-500 transition-colors hover:bg-slate-50"
                >
                  Decide later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default memo(LeadSlaDecisionModal);
