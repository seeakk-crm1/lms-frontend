import React, { memo } from 'react';
import { CalendarRange, Search, SlidersHorizontal, UserRound } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type { LeadFilters as LeadFiltersState, LeadMetaOptions } from '../../../types/lead.types';

interface LeadFiltersProps {
  search: string;
  filters: LeadFiltersState;
  meta?: LeadMetaOptions;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: Partial<LeadFiltersState>) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'LOB', label: 'LOB' },
];

const LeadFilters: React.FC<LeadFiltersProps> = ({
  search,
  filters,
  meta,
  onSearchChange,
  onFilterChange,
  onReset,
}) => (
  <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className="mb-5 flex items-center gap-2">
      <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
      <h3 className="text-sm font-black uppercase tracking-[0.24em] text-gray-900">Filter Leads</h3>
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.3fr_repeat(5,minmax(0,1fr))]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name, email, phone"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          aria-label="Search leads"
        />
      </div>

      <SearchableSelect
        name="stage"
        value={filters.stage || ''}
        options={(meta?.stages || []).map((item) => ({ value: item.id, label: item.label }))}
        placeholder="Stage"
        onChange={(event) => onFilterChange({ stage: event.target.value || undefined })}
      />

      <SearchableSelect
        name="assignedTo"
        value={filters.assignedTo || ''}
        options={(meta?.users || []).map((item) => ({ value: item.id, label: item.label }))}
        placeholder="Assigned User"
        onChange={(event) => onFilterChange({ assignedTo: event.target.value || undefined })}
      />

      <SearchableSelect
        name="source"
        value={filters.source || ''}
        options={(meta?.sources || []).map((item) => ({ value: item.id, label: item.label }))}
        placeholder="Source"
        onChange={(event) => onFilterChange({ source: event.target.value || undefined })}
      />

      <SearchableSelect
        name="status"
        value={filters.status || ''}
        options={statusOptions}
        placeholder="Status"
        onChange={(event) =>
          onFilterChange({
            status: (event.target.value || undefined) as LeadFiltersState['status'],
          })
        }
      />

      <div className="relative">
        <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          value={filters.createdFrom || ''}
          onChange={(event) => onFilterChange({ createdFrom: event.target.value || undefined })}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          aria-label="Created from date"
        />
      </div>

      <div className="relative">
        <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          value={filters.createdTo || ''}
          onChange={(event) => onFilterChange({ createdTo: event.target.value || undefined })}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          aria-label="Created to date"
        />
      </div>
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs font-semibold text-gray-500">
        Use filters to refine the pipeline view, then export the same dataset to CSV.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="rounded-2xl border border-gray-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 transition-colors hover:bg-gray-50"
      >
        Reset Filters
      </button>
    </div>
  </div>
);

export default memo(LeadFilters);
