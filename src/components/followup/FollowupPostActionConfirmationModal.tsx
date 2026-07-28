import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useFollowupWorkflowStore } from '../../store/followupWorkflowStore';

export default function FollowupPostActionConfirmationModal() {
  const confirmationModal = useFollowupWorkflowStore((state) => state.confirmationModal);
  const closeConfirmationModal = useFollowupWorkflowStore((state) => state.closeConfirmationModal);

  if (!confirmationModal || !confirmationModal.isOpen) return null;

  const { type, leadName } = confirmationModal;
  const isCompleted = type === 'COMPLETED';

  const titleText = isCompleted ? 'Follow-up completed successfully.' : 'Follow-up extended successfully.';
  const subtitleText = 'Would you like to open this lead?';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => closeConfirmationModal(false)}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl overflow-hidden z-10"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
                isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
              }`}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 leading-snug">{titleText}</h4>
                {leadName && (
                  <p className="text-xs font-bold text-gray-500 mt-0.5">
                    Lead: <span className="text-gray-900 font-black">{leadName}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => closeConfirmationModal(false)}
              className="rounded-xl border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-600 border-t border-gray-100 pt-4">
            {subtitleText}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => closeConfirmationModal(true)}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 px-4 text-sm font-black text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              Open Lead
            </button>
            <button
              type="button"
              onClick={() => closeConfirmationModal(false)}
              className="w-full sm:flex-1 inline-flex items-center justify-center rounded-2xl border border-gray-200 py-3 px-4 text-sm font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
