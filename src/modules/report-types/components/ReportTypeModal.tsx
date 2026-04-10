import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import ReportTypeForm from './ReportTypeForm';
import type { ReportType, ReportTypePayload } from '../types/reportType.types';

interface ReportTypeModalProps {
  open: boolean;
  onClose: () => void;
  initialValue?: ReportType | null;
  onSubmit: (payload: ReportTypePayload) => Promise<void>;
  isSubmitting?: boolean;
}

const ReportTypeModal: React.FC<ReportTypeModalProps> = ({ open, onClose, initialValue, onSubmit, isSubmitting }) => (
  <AnimatePresence>
    {open ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-0 sm:p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 18 }}
          transition={{ duration: 0.22 }}
          className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-none border-0 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,0.35)] sm:h-auto sm:max-h-[92vh] sm:rounded-[2rem] sm:border sm:border-gray-100"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-4 sm:px-8 sm:py-5">
            <div className="min-w-0">
              <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">
                {initialValue ? 'Edit Report Type' : 'Create Report Type'}
              </div>
              <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
                {initialValue ? 'Update report type' : 'Add report type'}
              </h2>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                Configure a reusable reporting template with the right module, data source, and approved filters.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-gray-200 p-3 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              aria-label="Close report type modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <ReportTypeForm
              initialValue={initialValue}
              onSubmit={onSubmit}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          </div>
        </motion.div>
      </motion.div>
    ) : null}
  </AnimatePresence>
);

export default ReportTypeModal;
