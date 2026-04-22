import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LeadDynamicsForm from './LeadDynamicsForm';
import type { LeadDynamicField, LeadDynamicsFormValues } from './types';

interface Props {
  isOpen: boolean;
  mode: 'create' | 'edit';
  selectedField: LeadDynamicField | null;
  existingNames: string[];
  suggestedSortOrder: number;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: LeadDynamicsFormValues) => Promise<void> | void;
}

const LeadDynamicsModal: React.FC<Props> = ({
  isOpen,
  mode,
  selectedField,
  existingNames,
  suggestedSortOrder,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [isHydrating, setIsHydrating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsHydrating(true);
    const timer = window.setTimeout(() => setIsHydrating(false), 220);
    return () => window.clearTimeout(timer);
  }, [isOpen, mode, selectedField?.id]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            aria-label="Close modal overlay"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden h-[94vh] sm:max-h-[92vh] sm:h-auto flex flex-col"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  {mode === 'create' ? 'Add Lead Dynamics Field' : 'Edit Lead Dynamics Field'}
                </h2>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Configure custom fields for lead forms.
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-black text-gray-500 hover:bg-gray-50 shrink-0"
              >
                Close
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">
              {isHydrating ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-11 rounded-xl shimmer-bg" />
                  <div className="h-11 rounded-xl shimmer-bg" />
                  <div className="h-40 rounded-2xl shimmer-bg" />
                  <div className="h-11 rounded-xl shimmer-bg" />
                </div>
              ) : (
                <LeadDynamicsForm
                  initialData={selectedField}
                  existingNames={existingNames}
                  suggestedSortOrder={suggestedSortOrder}
                  isSubmitting={isSubmitting}
                  onCancel={onClose}
                  onSubmit={onSubmit}
                />
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default React.memo(LeadDynamicsModal);
