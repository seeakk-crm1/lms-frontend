import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const SnoozeFollowUpModal: React.FC<Props> = ({ isOpen, value, onChange, onClose, onSubmit, isSubmitting = false }) => (
  <AnimatePresence>
    {isOpen ? (
      <div className="fixed inset-0 z-[170] flex items-end justify-center p-0 sm:items-center sm:p-4">
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
            <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">New Reminder Time</label>
            <input
              type="datetime-local"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="flex gap-3">
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
                disabled={isSubmitting || !value}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Snooze
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    ) : null}
  </AnimatePresence>
);

export default React.memo(SnoozeFollowUpModal);
