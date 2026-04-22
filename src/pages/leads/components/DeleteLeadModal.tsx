import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Archive, Trash2, X } from 'lucide-react';

interface DeleteLeadModalProps {
  isOpen: boolean;
  leadName: string;
  isArchiving: boolean;
  isPermanentlyDeleting: boolean;
  onClose: () => void;
  onArchive: () => void;
  onPermanentDelete: () => void;
}

const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({
  isOpen,
  leadName,
  isArchiving,
  isPermanentlyDeleting,
  onClose,
  onArchive,
  onPermanentDelete,
}) => {
  const isBusy = isArchiving || isPermanentlyDeleting;

  useEffect(() => {
    if (!isOpen || isBusy) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBusy, isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            type="button"
            aria-label="Close lead removal modal"
            onClick={onClose}
            disabled={isBusy}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm disabled:cursor-not-allowed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(event) => event.stopPropagation()}
            className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:rounded-[32px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-lead-title"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-rose-50 blur-3xl opacity-60" />

            <div className="p-5 sm:p-6 md:p-8">
              <div className="mb-5 flex items-center justify-between sm:mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                  <Archive className="h-6 w-6" />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isBusy}
                  className="relative z-10 rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close lead removal modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h2 id="delete-lead-title" className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                  Archive Or Delete Lead?
                </h2>
                <p className="text-sm font-semibold leading-relaxed text-gray-500">
                  Choose how you want to remove <span className="font-black text-rose-600">"{leadName}"</span>.
                  Archive keeps history and audit visibility. Permanent delete removes the lead and related records for good.
                </p>
              </div>

              <div className="mt-6 space-y-3 sm:mt-8">
                <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <Archive className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-[11px] font-bold leading-normal text-emerald-700">
                    Archive is the safer option. The lead disappears from active workflows, but history and audit trail stay preserved.
                  </p>
                </div>
                <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <p className="text-[11px] font-bold leading-normal text-amber-700">
                    Permanent delete is irreversible. This will remove the lead and associated records that should no longer be retained.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isBusy}
                  className="order-3 w-full rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 sm:order-1 sm:border-transparent sm:bg-transparent sm:px-0"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onArchive}
                  disabled={isBusy}
                  className="order-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:order-2"
                >
                  <Archive className="h-4 w-4" />
                  <span>{isArchiving ? 'Archiving…' : 'Archive Lead'}</span>
                </button>
                <button
                  type="button"
                  onClick={onPermanentDelete}
                  disabled={isBusy}
                  className="order-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-rose-300 sm:order-3"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isPermanentlyDeleting ? 'Deleting…' : 'Permanent Delete'}</span>
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
