import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import type { ReportType } from '../types/reportType.types';

interface DeleteReportTypeModalProps {
  open: boolean;
  reportType: ReportType | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteReportTypeModal: React.FC<DeleteReportTypeModalProps> = ({
  open,
  reportType,
  onClose,
  onConfirm,
  isDeleting,
}) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-0 sm:p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 18 }}
          transition={{ duration: 0.2 }}
          onClick={(event) => event.stopPropagation()}
          className="flex h-full w-full max-w-xl flex-col overflow-hidden rounded-none border-0 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)] sm:h-auto sm:rounded-[2rem] sm:border sm:border-gray-100"
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="mb-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-rose-600">
                  Delete Report Type
                </div>
                <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">Delete this report type?</h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  This will remove <span className="font-black text-gray-700">{reportType?.name || 'this report type'}</span> from the active list.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 p-3 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              aria-label="Close delete confirmation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm font-semibold text-rose-700">
              Deleted report types are hidden from normal usage, and this action should only be done when the template is no longer needed.
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="inline-flex items-center justify-center rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(244,63,94,0.8)] transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {isDeleting ? 'Deleting...' : 'Delete Report Type'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default DeleteReportTypeModal;
