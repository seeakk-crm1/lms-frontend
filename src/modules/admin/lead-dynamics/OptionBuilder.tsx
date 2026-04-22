import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import type { LeadDynamicOption } from './types';

interface Props {
  options: LeadDynamicOption[];
  rowErrors: Record<number, string>;
  canDelete: boolean;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onChangeOption: (index: number, patch: Partial<LeadDynamicOption>) => void;
}

const OptionBuilder: React.FC<Props> = ({
  options,
  rowErrors,
  canDelete,
  onAddOption,
  onRemoveOption,
  onChangeOption,
}) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4 md:p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-black text-gray-900">Options Builder</h4>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Add non-empty unique options for selectable fields.
          </p>
        </div>
        <motion.button
          type="button"
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddOption}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4" />
          Add Option
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {options.map((option, index) => (
          <motion.div
            key={`opt-${index}`}
            layout
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className={`rounded-xl border p-3 bg-white grid grid-cols-1 md:grid-cols-12 gap-3 items-end ${
              rowErrors[index] ? 'border-red-200' : 'border-gray-100'
            }`}
          >
            <div className="md:col-span-7">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Value Name</label>
              <input
                value={option.value}
                onChange={(event) => onChangeOption(index, { value: event.target.value })}
                placeholder="Option value"
                className={`w-full mt-1 px-3 py-2.5 rounded-xl border bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  rowErrors[index] ? 'border-red-200' : 'border-gray-200'
                }`}
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Sort Order</label>
              <input
                type="number"
                min={1}
                value={option.sortOrder}
                onChange={(event) =>
                  onChangeOption(index, { sortOrder: Math.max(1, Number(event.target.value) || 1) })
                }
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="md:col-span-1 md:justify-self-end">
              <button
                type="button"
                onClick={() => onRemoveOption(index)}
                disabled={!canDelete}
                className={`w-full md:w-10 md:h-10 rounded-xl inline-flex items-center justify-center transition-all ${
                  canDelete
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title={canDelete ? 'Delete option' : 'At least one option is required'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {rowErrors[index] ? (
              <div className="md:col-span-12 inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{rowErrors[index]}</span>
              </div>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(OptionBuilder);
