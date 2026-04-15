import React, { memo, useMemo } from 'react';
import { CalendarRange, Filter, RotateCcw, Tags } from 'lucide-react';
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
  const activeChips = useMemo(() => {
    const chips: string[] = [];
    const stage = meta?.stages?.find((item) => item.id === filters.stageId)?.label;
    const assigned = meta?.users?.find((item) => item.id === filters.assignedTo)?.label;
    const lifecycle = meta?.lifeCycles?.find((item) => item.id === filters.lifecycleId)?.label;
    const source = meta?.sources?.find((item) => item.id === filters.sourceId)?.label;

    if (stage) chips.push(`Stage: ${stage}`);
    if (assigned) chips.push(`Assigned: ${assigned}`);
    if (lifecycle) chips.push(`Life Cycle: ${lifecycle}`);
    if (source) chips.push(`Source: ${source}`);
    if (filters.followupDateFrom || filters.followupDateTo) {
      chips.push(`Follow-up: ${filters.followupDateFrom || '...'} to ${filters.followupDateTo || '...'}`);
    }
    if (filters.createdDateFrom || filters.createdDateTo) {
      chips.push(`Created: ${filters.createdDateFrom || '...'} to ${filters.createdDateTo || '...'}`);
    }

    return chips;
  }, [filters, meta]);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Filter className="h-4 w-4 text-emerald-500" />
        <h3 className="text-sm font-black uppercase tracking-[0.24em] text-gray-900">Filter Leads</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SearchableSelect
          name="stageId"
          value={filters.stageId || ''}
          options={(meta?.stages || []).map((item) => ({ value: item.id, label: item.label }))}
          placeholder="Select Stage"
          onChange={(event) => onFilterChange({ stageId: event.target.value || undefined })}
        />

        <SearchableSelect
          name="assignedTo"
          value={filters.assignedTo || ''}
          options={(meta?.users || []).map((item) => ({ value: item.id, label: item.label }))}
          placeholder="Select Assignee"
          onChange={(event) => onFilterChange({ assignedTo: event.target.value || undefined })}
        />

        <SearchableSelect
          name="lifecycleId"
          value={filters.lifecycleId || ''}
          options={(meta?.lifeCycles || []).map((item) => ({ value: item.id, label: item.label }))}
          placeholder="Select Lead Life Cycle"
          allowClear
          clearLabel="All life cycles"
          onChange={(event) => onFilterChange({ lifecycleId: event.target.value || undefined })}
        />

        <SearchableSelect
          name="sourceId"
          value={filters.sourceId || ''}
          options={(meta?.sources || []).map((item) => ({ value: item.id, label: item.label }))}
          placeholder="Select Lead Source"
          onChange={(event) => onFilterChange({ sourceId: event.target.value || undefined })}
        />

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

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
            <Tags className="h-3.5 w-3.5" />
            Active Filters
          </div>
          {activeChips.length ? (
            activeChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
              >
                {chip}
              </span>
            ))
          ) : (
            <span className="text-xs font-semibold text-gray-500">No filters applied. You can preview all active leads.</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 transition-colors hover:bg-gray-50"
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
