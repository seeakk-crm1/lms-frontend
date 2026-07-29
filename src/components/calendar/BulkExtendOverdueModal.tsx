import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useActiveExtensionReasonsQuery } from '../../modules/followup-extension-reasons/hooks/useFollowUpExtensionReasons';

interface Props {
  isOpen: boolean;
  selectedCount: number;
  value: string;
  onChange: (value: string) => void;
  recentDescription: string;
  onRecentDescriptionChange: (value: string) => void;
  selectedReasonId: string;
  onSelectedReasonIdChange: (value: string) => void;
  autoDistribute: boolean;
  onAutoDistributeChange: (value: boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  stackAboveMandatoryGate?: boolean;
}

const BulkExtendOverdueModal: React.FC<Props> = ({
  isOpen,
  selectedCount,
  value,
  onChange,
  recentDescription,
  onRecentDescriptionChange,
  selectedReasonId,
  onSelectedReasonIdChange,
  autoDistribute,
  onAutoDistributeChange,
  onClose,
  onSubmit,
  isSubmitting = false,
  stackAboveMandatoryGate = false,
}) => {
  const layerZ = stackAboveMandatoryGate ? 'z-[10350]' : 'z-[170]';
  const { data: activeReasons = [] } = useActiveExtensionReasonsQuery(isOpen);

  const minDate = useMemo(() => {
    const next = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
  }, [isOpen]);

  const hasAnyInput = value && (selectedReasonId || recentDescription.trim());

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className={`fixed inset-0 ${layerZ} flex items-end justify-center p-0 sm:items-center sm:p-4`}>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/55 backdrop-blur-sm"
            aria-label="Close bulk extend modal"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="relative w-full max-w-md rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-black text-gray-900">Bulk Extend ({selectedCount})</h3>
              <button onClick={onClose} className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:bg-gray-50">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  New Target Date
                </label>
                <input
                  type="date"
                  value={value}
                  min={minDate}
                  onChange={(event) => onChange(event.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Follow-Up Extension Reason
                </label>
                <select
                  value={selectedReasonId}
                  onChange={(event) => onSelectedReasonIdChange(event.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Select Predefined Reason (Optional) --</option>
                  {activeReasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.reasonName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400">
                  Custom Description
                </label>
                <textarea
                  value={recentDescription}
                  onChange={(event) => onRecentDescriptionChange(event.target.value)}
                  rows={4}
                  placeholder="Record outcome before extending..."
                  className="mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 resize-y"
                />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="autoDistribute"
                  checked={autoDistribute}
                  onChange={(e) => onAutoDistributeChange(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <label htmlFor="autoDistribute" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Auto-distribute selected follow-ups evenly across time
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-black text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting || !hasAnyInput}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-sm font-black text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Confirm Extension
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default React.memo(BulkExtendOverdueModal);
