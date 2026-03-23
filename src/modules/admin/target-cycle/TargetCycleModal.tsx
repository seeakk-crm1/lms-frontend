import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TargetCycleForm from './TargetCycleForm';
import type { TargetCycle, TargetCycleFormValues } from './types';

interface Props {
  isOpen: boolean;
  mode: 'create' | 'edit';
  selectedCycle: TargetCycle | null;
  existingNames: string[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TargetCycleFormValues) => Promise<void> | void;
}

const TargetCycleModal: React.FC<Props> = ({
  isOpen,
  mode,
  selectedCycle,
  existingNames,
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
  }, [isOpen, mode, selectedCycle?.id]);

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
                  {mode === 'create' ? 'Add Target Cycle' : 'Edit Target Cycle'}
                </h2>
                <p className="text-xs text-gray-500 font-semibold mt-1">
                  Define monthly working day ranges between 28 and 31 days.
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
                  <div className="h-36 rounded-2xl shimmer-bg" />
                  <div className="h-11 rounded-xl shimmer-bg" />
                </div>
              ) : (
                <TargetCycleForm
                  initialData={selectedCycle}
                  existingNames={existingNames}
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

export default React.memo(TargetCycleModal);
