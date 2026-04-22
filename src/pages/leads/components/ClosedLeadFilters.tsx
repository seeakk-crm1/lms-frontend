import React, { memo } from 'react';
import { CalendarRange, DollarSign, Search, SlidersHorizontal } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type { ClosedLeadFilters as ClosedLeadFiltersState, LeadMetaOptions } from '../../../types/lead.types';

interface ClosedLeadFiltersProps {
  search: string;
  filters: ClosedLeadFiltersState;
  meta?: LeadMetaOptions;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: Partial<ClosedLeadFiltersState>) => void;
  onReset: () => void;
}

const closureTypeOptions = [
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';

const ClosedLeadFilters: React.FC<ClosedLeadFiltersProps> = ({
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
      <h3 className="text-sm font-black uppercase tracking-[0.24em] text-gray-900">Filter Closed Leads</h3>
    </div>

    <div className="grid gap-4 xl:grid-cols-[1.2fr_repeat(6,minmax(0,1fr))]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name, email, phone"
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
          aria-label="Search closed leads"
        />
      </div>

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
        name="closureType"
        value={filters.closureType || ''}
        options={closureTypeOptions}
        placeholder="Closure Type"
        onChange={(event) =>
          onFilterChange({
            closureType: (event.target.value || undefined) as ClosedLeadFiltersState['closureType'],
          })
        }
      />

      <div className="relative">
        <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(event) => onFilterChange({ dateFrom: event.target.value || undefined })}
          className={`${inputClassName} pl-11`}
          aria-label="Closed from date"
        />
      </div>

      <div className="relative">
        <CalendarRange className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={(event) => onFilterChange({ dateTo: event.target.value || undefined })}
          className={`${inputClassName} pl-11`}
          aria-label="Closed to date"
        />
      </div>

      <div className="relative">
        <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="number"
          min="0"
          value={filters.minRevenue || ''}
          onChange={(event) => onFilterChange({ minRevenue: event.target.value || undefined })}
          placeholder="Min revenue"
          className={`${inputClassName} pl-11`}
          aria-label="Minimum generated revenue"
        />
      </div>

      <div className="relative">
        <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="number"
          min="0"
          value={filters.maxRevenue || ''}
          onChange={(event) => onFilterChange({ maxRevenue: event.target.value || undefined })}
          placeholder="Max revenue"
          className={`${inputClassName} pl-11`}
          aria-label="Maximum generated revenue"
        />
      </div>
    </div>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs font-semibold text-gray-500">
        Use revenue, ownership, and closure filters to audit deal outcomes or prepare exports for reporting.
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

export default memo(ClosedLeadFilters);
