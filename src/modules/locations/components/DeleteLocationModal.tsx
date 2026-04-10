import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteLocationModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isSubmitting?: boolean;
}

const DeleteLocationModal: React.FC<DeleteLocationModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  onClose,
  onConfirm,
  isSubmitting,
}) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 18 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-[0_30px_90px_-35px_rgba(16,185,129,0.2)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{title}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">{description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-emerald-100 p-3 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
              aria-label="Close delete modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void onConfirm()}
              disabled={isSubmitting}
              className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Deleting...' : confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default DeleteLocationModal;
