import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onContinue: () => void;
  onChangeDate: () => void;
}

const WeeklyOffScheduleConfirmModal: React.FC<Props> = ({ isOpen, onContinue, onChangeDate }) => (
  <AnimatePresence>
    {isOpen ? (
      <div className="fixed inset-0 z-[180] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="weekly-off-schedule-title"
        >
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Weekly-Off Reminder</p>
                <h3 id="weekly-off-schedule-title" className="text-lg font-black text-gray-900">
                  Non-working day
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onChangeDate}
              className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50"
              aria-label="Close weekly-off reminder"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm font-semibold leading-relaxed text-amber-900">
                This date is configured as a Weekly-Off. Are you sure you want to schedule the follow-up on a non-working
                day?
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onChangeDate}
                className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-600 hover:bg-gray-50"
              >
                Change Date
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="flex-1 rounded-2xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600"
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    ) : null}
  </AnimatePresence>
);

export default React.memo(WeeklyOffScheduleConfirmModal);
