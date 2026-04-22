import React, { memo, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DollarSign, Save, X } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type { LeadClosureType, LeadListItem } from '../../../types/lead.types';

interface RevenueEditModalProps {
  isOpen: boolean;
  lead: LeadListItem | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (payload: { generatedRevenue: number; closureType: LeadClosureType }) => void;
}

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const closureTypeOptions = [
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const RevenueEditModal: React.FC<RevenueEditModalProps> = ({ isOpen, lead, isSubmitting, onClose, onConfirm }) => {
  const [generatedRevenue, setGeneratedRevenue] = useState('');
  const [closureType, setClosureType] = useState<LeadClosureType | ''>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setGeneratedRevenue(lead?.generatedRevenue !== undefined && lead?.generatedRevenue !== null ? String(lead.generatedRevenue) : '');
    setClosureType((lead?.closureType as LeadClosureType | undefined) || 'WON');
    setError('');
  }, [isOpen, lead]);

  const handleConfirm = () => {
    if (!closureType) {
      setError('Closure type is required.');
      return;
    }

    if (generatedRevenue.trim() === '' || Number.isNaN(Number(generatedRevenue)) || Number(generatedRevenue) < 0) {
      setError('Generated revenue must be a valid amount of 0 or more.');
      return;
    }

    onConfirm({
      generatedRevenue: Number(generatedRevenue),
      closureType,
    });
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-revenue-title"
          >
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-50 blur-3xl opacity-70" />

            <div className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Close revenue edit modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <h2 id="edit-revenue-title" className="text-2xl font-black tracking-tight text-gray-900">
                  Update Closed Revenue
                </h2>
                <p className="text-sm font-semibold leading-relaxed text-gray-500">
                  Finalize the outcome for <span className="font-black text-gray-900">{lead?.name || 'this lead'}</span> so revenue reporting stays accurate.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-black text-gray-900">Generated Revenue</label>
                  <input
                    type="number"
                    min="0"
                    value={generatedRevenue}
                    onChange={(event) => setGeneratedRevenue(event.target.value)}
                    placeholder="Enter revenue amount"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-gray-900">Closure Type</label>
                  <SearchableSelect
                    name="closureType"
                    value={closureType}
                    options={closureTypeOptions}
                    placeholder="Select closure type"
                    onChange={(event) => setClosureType(event.target.value as LeadClosureType)}
                  />
                </div>

                {error ? <p className="text-sm font-bold text-rose-500">{error}</p> : null}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 py-3 text-sm font-black text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-300"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? 'Saving…' : 'Save Revenue'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};

export default memo(RevenueEditModal);
