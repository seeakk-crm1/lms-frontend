import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type {
  LeadLifeCycle,
  LeadLifeCycleFormValues,
  LeadStageOption,
} from '../../../types/admin/lead-life-cycle/leadLifeCycle.types';
import LeadLifeCycleForm from './LeadLifeCycleForm';

interface Props {
  isOpen: boolean;
  mode: 'create' | 'edit';
  selectedLifeCycle: LeadLifeCycle | null;
  stageOptions: LeadStageOption[];
  existingNames: string[];
  isSubmitting: boolean;
  isLoadingStages: boolean;
  onClose: () => void;
  onSubmit: (payload: LeadLifeCycleFormValues) => Promise<void> | void;
}

const LeadLifeCycleFormModal: React.FC<Props> = ({
  isOpen,
  mode,
  selectedLifeCycle,
  stageOptions,
  existingNames,
  isSubmitting,
  isLoadingStages,
  onClose,
  onSubmit,
}) => {
  const [isHydrating, setIsHydrating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsHydrating(true);
    const timer = window.setTimeout(() => setIsHydrating(false), 220);
    return () => window.clearTimeout(timer);
  }, [isOpen, mode, selectedLifeCycle?.id]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            aria-label="Close lead life cycle modal"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <h2 className="text-lg font-black text-gray-900 sm:text-xl">
                  {mode === 'create' ? 'Create Lead Life Cycle' : 'Edit Lead Life Cycle'}
                </h2>
                <p className="mt-1 text-xs font-semibold text-gray-500">
                  Configure stage transitions and SLA expectations for lead progression.
                </p>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 rounded-xl border border-gray-200 px-3 py-2 text-xs font-black text-gray-500 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="custom-scrollbar overflow-y-auto p-4 sm:p-6">
              {isHydrating || isLoadingStages ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-10 rounded-xl shimmer-bg" />
                  <div className="h-10 rounded-xl shimmer-bg" />
                  <div className="h-40 rounded-2xl shimmer-bg" />
                  <div className="h-10 rounded-xl shimmer-bg" />
                </div>
              ) : (
                <LeadLifeCycleForm
                  initialData={selectedLifeCycle}
                  stageOptions={stageOptions}
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

export default React.memo(LeadLifeCycleFormModal);
