import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';
import type { TargetCycleRange } from './types';

interface Props {
  index: number;
  range: TargetCycleRange;
  canDelete: boolean;
  rowError?: string;
  onChange: (index: number, patch: Partial<TargetCycleRange>) => void;
  onDelete: (index: number) => void;
}

const dayOptions = Array.from({ length: 31 }, (_, idx) => idx + 1);

const RangeSelector: React.FC<Props> = ({ index, range, canDelete, rowError, onChange, onDelete }) => {
  const selectedDays = useMemo(() => Math.max(0, range.endDay - range.startDay + 1), [range.endDay, range.startDay]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-2xl border p-3 md:p-4 bg-white transition-all ${
        rowError ? 'border-red-200 shadow-sm shadow-red-100/60' : 'border-gray-100 shadow-sm'
      }`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-1 md:col-span-4">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Start Date</label>
          <select
            value={range.startDay}
            onChange={(event) => onChange(index, { startDay: Number(event.target.value) })}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {dayOptions.map((day) => (
              <option key={`start-${index}-${day}`} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1 md:col-span-4">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">End Date</label>
          <select
            value={range.endDay}
            onChange={(event) => onChange(index, { endDay: Number(event.target.value) })}
            className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {dayOptions.map((day) => (
              <option key={`end-${index}-${day}`} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1 md:col-span-3">
          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black">Selected Days</label>
          <div className="mt-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-black text-gray-700">
            {selectedDays}
          </div>
        </div>

        <div className="sm:col-span-1 md:col-span-1 md:justify-self-end">
          <button
            type="button"
            onClick={() => onDelete(index)}
            disabled={!canDelete}
            className={`w-full sm:h-[42px] md:w-10 md:h-10 rounded-xl inline-flex items-center justify-center transition-all ${
              canDelete
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            title={canDelete ? 'Delete range' : 'At least one range is required'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {rowError ? (
        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600" title={rowError}>
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{rowError}</span>
        </div>
      ) : null}
    </motion.div>
  );
};

export default React.memo(RangeSelector);
