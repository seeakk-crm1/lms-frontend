import React, { memo, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';

interface LOBModalProps {
  isOpen: boolean;
  isSubmitting?: boolean;
  initialReasonId?: string;
  initialRemarks?: string;
  lobReasonOptions: Array<{ value: string; label: string }>;
  onClose: () => void;
  onConfirm: (payload: { reasonId: string; remarks: string }) => void;
}

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const LOBModal: React.FC<LOBModalProps> = ({
  isOpen,
  isSubmitting = false,
  initialReasonId = '',
  initialRemarks = '',
  lobReasonOptions,
  onClose,
  onConfirm,
}) => {
  const [reasonId, setReasonId] = useState(initialReasonId);
  const [remarks, setRemarks] = useState(initialRemarks);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setReasonId(initialReasonId);
    setRemarks(initialRemarks);
    setError('');
  }, [initialReasonId, initialRemarks, isOpen]);

  const handleConfirm = () => {
    if (!reasonId.trim() || !remarks.trim()) {
      setError('LOB reason and remarks are both required.');
      return;
    }

    onConfirm({ reasonId: reasonId.trim(), remarks: remarks.trim() });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            aria-label="Close LOB modal"
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="relative w-full max-w-xl rounded-t-3xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="mb-2 flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-[0.28em]">Loss Of Business</span>
              </div>
              <h3 className="text-xl font-black text-gray-900">Capture the LOB context before moving ahead</h3>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                This stage change is treated as a final pipeline event, so we need a reason and remarks for the audit trail.
              </p>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div>
                <label className="mb-2 block text-sm font-black text-gray-900">LOB Reason</label>
                <SearchableSelect
                  options={lobReasonOptions}
                  value={reasonId}
                  onChange={(event) => setReasonId(event.target.value)}
                  placeholder={lobReasonOptions.length ? 'Select LOB reason' : 'No active LOB reasons'}
                  name="reasonId"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-900">Remarks</label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  className={`${inputClassName} resize-none`}
                  placeholder="Explain why the opportunity was lost"
                />
              </div>

              {error ? <p className="text-sm font-bold text-rose-500">{error}</p> : null}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm font-black text-gray-500 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Saving…' : 'Confirm LOB'}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default memo(LOBModal);
