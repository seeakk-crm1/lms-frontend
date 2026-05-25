import React, { memo } from 'react';
import { CalendarRange, RotateCcw, SlidersHorizontal } from 'lucide-react';
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

interface CompactFieldProps {
  label: string;
  children: React.ReactNode;
}

const CompactField: React.FC<CompactFieldProps> = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">{label}</label>
    {children}
  </div>
);

const BulkAssignFilters: React.FC<BulkAssignFiltersProps> = ({
  filters,
  meta,
  isApplying = false,
  onFilterChange,
  onApply,
  onReset,
}) => {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
        <h3 className="text-sm font-black uppercase tracking-[0.24em] text-gray-900">Filter Leads</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompactField label="Stage">
          <SearchableSelect
            name="stageId"
            value={filters.stageId || ''}
            options={(meta?.stages || []).map((item) => ({ value: item.id, label: item.label }))}
            placeholder="Stage"
            allowClear
            clearLabel="All stages"
            onChange={(event) => onFilterChange({ stageId: event.target.value || undefined })}
          />
        </CompactField>

        <CompactField label="Assigned User">
          <SearchableSelect
            name="assignedTo"
            value={filters.assignedTo || ''}
            options={(meta?.users || []).map((item) => ({ value: item.id, label: item.label }))}
            placeholder="Assigned user"
            allowClear
            clearLabel="All owners / Unassigned"
            onChange={(event) => onFilterChange({ assignedTo: event.target.value || undefined })}
          />
        </CompactField>

        <CompactField label="Source">
          <SearchableSelect
            name="sourceId"
            value={filters.sourceId || ''}
            options={(meta?.sources || []).map((item) => ({ value: item.id, label: item.label }))}
            placeholder="Source"
            allowClear
            clearLabel="All sources"
            onChange={(event) => onFilterChange({ sourceId: event.target.value || undefined })}
          />
        </CompactField>

        <CompactField label="Lifecycle">
          <SearchableSelect
            name="lifecycleId"
            value={filters.lifecycleId || ''}
            options={(meta?.lifeCycles || []).map((item) => ({ value: item.id, label: item.label }))}
            placeholder="Lifecycle"
            allowClear
            clearLabel="All life cycles"
            onChange={(event) => onFilterChange({ lifecycleId: event.target.value || undefined })}
          />
        </CompactField>

        <CompactField label="Follow-up From">
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
        </CompactField>

        <CompactField label="Follow-up To">
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
        </CompactField>

        <CompactField label="Created From">
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
        </CompactField>

        <CompactField label="Created To">
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
        </CompactField>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <p className="max-w-2xl text-xs font-semibold leading-5 text-gray-500">
          Use these filters to preview the exact active leads that will be reassigned without changing the assignment layout.
        </p>

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
