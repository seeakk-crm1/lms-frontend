import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import type { LOBReason } from '../types/lobReason.types';

interface DeleteLOBReasonModalProps {
  open: boolean;
  reason: LOBReason | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteLOBReasonModal: React.FC<DeleteLOBReasonModalProps> = ({ open, reason, isDeleting, onClose, onConfirm }) => (
  <AnimatePresence>
    {open && reason ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 18 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-[2rem] border border-gray-100 bg-white p-6 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-black text-gray-900">Delete LOB reason?</div>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  This will deactivate <span className="font-black text-gray-700">{reason.name}</span> and remove it from new LOB selections.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 p-3 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              aria-label="Close delete dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? 'Deleting...' : 'Delete Reason'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default DeleteLOBReasonModal;
