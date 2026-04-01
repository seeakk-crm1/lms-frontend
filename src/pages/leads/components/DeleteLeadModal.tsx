import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Archive, Trash2, X } from 'lucide-react';

interface DeleteLeadModalProps {
  isOpen: boolean;
  leadName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({
  isOpen,
  leadName,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-lead-title"
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-rose-50 blur-3xl opacity-60" />

            <div className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                  <Archive className="h-6 w-6" />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close archive lead modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h2 id="delete-lead-title" className="text-2xl font-black tracking-tight text-gray-900">
                  Archive Lead?
                </h2>
                <p className="text-sm font-semibold leading-relaxed text-gray-500">
                  Are you sure you want to archive <span className="font-black text-rose-600">"{leadName}"</span>?
                  The lead will be removed from the active list, while history and audit trail stay preserved.
                </p>
              </div>

              <div className="mt-8 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-[11px] font-bold leading-normal text-amber-700">
                  This is a soft delete. Archived leads are hidden from active workflows, but existing references remain for reporting and traceability.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 py-3 text-sm font-black text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-rose-500 py-4 text-sm font-black text-white shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeleting ? 'Archiving…' : 'Archive Lead'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default DeleteLeadModal;
