import React, { memo, useState } from 'react';
import { CalendarRange, RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchableSelect from '../../../components/SearchableSelect';
import type { BulkAssignFilters as BulkAssignFiltersState, LeadMetaOptions } from '../../../types/lead.types';

interface BulkAssignFiltersProps {
  filters: BulkAssignFiltersState;
  meta?: LeadMetaOptions;
  isApplying?: boolean;
  onFilterChange: (filters: Partial<BulkAssignFiltersState>) => void;
  onApply: () => void;
  onReset: () => void;
}

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const BulkAssignFilters: React.FC<BulkAssignFiltersProps> = ({
  filters,
  meta,
  isApplying = false,
  onFilterChange,
  onApply,
  onReset,
}) => {
  const [showDates, setShowDates] = useState(false);

  // Check if any date filters are currently active to auto-expand or show indicator
  const hasActiveDates = Boolean(
    filters.followupDateFrom ||
      filters.followupDateTo ||
      filters.createdDateFrom ||
      filters.createdDateTo
  );

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-black uppercase tracking-[0.24em] text-gray-900">Filter Leads</h3>
        </div>
        {hasActiveDates && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            Date filters active
          </span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SearchableSelect
          name="stageId"
          value={filters.stageId || ''}
          options={(meta?.stages || []).map((item) => ({ value: item.id, label: item.label }))}
          placeholder="Stage"
          allowClear
          clearLabel="All stages"
          onChange={(event) => onFilterChange({ stageId: event.target.value || undefined })}
        />

        <SearchableSelect
          name="assignedTo"
          value={filters.assignedTo || ''}
          options={(meta?.users || []).map((item) => ({ value: item.id, label: item.label }))}
          placeholder="Assigned User"
          allowClear
          clearLabel="All owners / Unassigned"
          onChange={(event) => onFilterChange({ assignedTo: event.target.value || undefined })}
        />

        <SearchableSelect
          name="sourceId"
          value={filters.sourceId || ''}
          options={(meta?.sources || []).map((item) => ({ value: item.id, label: item.label }))}
          placeholder="Source"
          allowClear
          clearLabel="All sources"
          onChange={(event) => onFilterChange({ sourceId: event.target.value || undefined })}
        />

        <SearchableSelect
          name="lifecycleId"
          value={filters.lifecycleId || ''}
          options={(meta?.lifeCycles || []).map((item) => ({ value: item.id, label: item.label }))}
          placeholder="Lifecycle"
          allowClear
          clearLabel="All life cycles"
          onChange={(event) => onFilterChange({ lifecycleId: event.target.value || undefined })}
        />
      </div>

      <AnimatePresence>
        {showDates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-gray-100">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Follow-up From</label>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.followupDateFrom || ''}
                    onChange={(event) => onFilterChange({ followupDateFrom: event.target.value || undefined })}
                    className={inputClassName}
                    aria-label="Follow-up from date"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Follow-up To</label>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.followupDateTo || ''}
                    onChange={(event) => onFilterChange({ followupDateTo: event.target.value || undefined })}
                    className={inputClassName}
                    aria-label="Follow-up to date"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Created From</label>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.createdDateFrom || ''}
                    onChange={(event) => onFilterChange({ createdDateFrom: event.target.value || undefined })}
                    className={inputClassName}
                    aria-label="Created from date"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Created To</label>
                <div className="relative">
                  <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={filters.createdDateTo || ''}
                    onChange={(event) => onFilterChange({ createdDateTo: event.target.value || undefined })}
                    className={inputClassName}
                    aria-label="Created to date"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="max-w-2xl text-xs font-semibold leading-5 text-gray-500">
          Use these filters to preview the exact active leads that will be reassigned without changing the assignment layout.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDates(!showDates)}
            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
              showDates
                ? 'bg-slate-100 text-slate-800 border-slate-200'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CalendarRange className="h-3.5 w-3.5" />
            <span>Date Ranges</span>
            {showDates ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 transition-colors hover:bg-gray-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>

          <button
            type="button"
            onClick={onApply}
            disabled={isApplying}
            className="rounded-2xl bg-emerald-500 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isApplying ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(BulkAssignFilters);
