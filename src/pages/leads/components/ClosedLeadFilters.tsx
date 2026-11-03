import React, { memo, useMemo } from 'react';
import { CalendarRange, DollarSign, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import OfficeFilterSelect from '../../../components/OfficeFilterSelect';
import type { ClosedLeadFilters as ClosedLeadFiltersState, LeadMetaOptions } from '../../../types/lead.types';

interface ClosedLeadFiltersProps {
  search: string;
  filters: ClosedLeadFiltersState;
  meta?: LeadMetaOptions;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: Partial<ClosedLeadFiltersState>) => void;
  onReset: () => void;
  showOfficeFilter?: boolean;
}

const closureTypeOptions = [
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const inputClassName =
  'h-9 w-full rounded-lg border border-gray-200/90 bg-gray-50/70 px-3 py-1.5 text-xs font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20';

const ClosedLeadFilters: React.FC<ClosedLeadFiltersProps> = ({
  search,
  filters,
  meta,
  onSearchChange,
  onFilterChange,
  onReset,
  showOfficeFilter = false,
}) => {
  const activeCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (filters.assignedTo) count += 1;
    if (filters.source) count += 1;
    if (filters.officeId) count += 1;
    if (filters.closureType) count += 1;
    if (filters.dateFrom) count += 1;
    if (filters.dateTo) count += 1;
    if (filters.minRevenue) count += 1;
    if (filters.maxRevenue) count += 1;
    return count;
  }, [filters, search]);

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-3 shadow-xs space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search closed leads..."
            className="h-9 w-full rounded-lg border border-gray-200/90 bg-gray-50/70 py-1.5 pl-8 pr-7 text-xs font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            aria-label="Search closed leads"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Assigned User */}
        <div className="w-[140px] sm:w-[150px]">
          <SearchableSelect
            name="assignedTo"
            value={filters.assignedTo || ''}
            options={(meta?.users || []).map((item) => ({ value: item.id, label: item.label }))}
            placeholder="Assigned User"
            size="sm"
            allowClear
            clearLabel="All Users"
            onChange={(event) => onFilterChange({ assignedTo: event.target.value || undefined })}
          />
        </div>

        {/* Source */}
        <div className="w-[125px] sm:w-[135px]">
          <SearchableSelect
            name="source"
            value={filters.source || ''}
            options={(meta?.sources || []).map((item) => ({ value: item.id, label: item.label }))}
            placeholder="Source"
            size="sm"
            allowClear
            clearLabel="All Sources"
            onChange={(event) => onFilterChange({ source: event.target.value || undefined })}
          />
        </div>

        {/* Office */}
        {showOfficeFilter && (
          <div className="w-[140px] sm:w-[155px]">
            <OfficeFilterSelect
              value={filters.officeId || ''}
              size="sm"
              onChange={(officeId) => onFilterChange({ officeId })}
            />
          </div>
        )}

        {/* Closure Type */}
        <div className="w-[120px] sm:w-[130px]">
          <SearchableSelect
            name="closureType"
            value={filters.closureType || ''}
            options={closureTypeOptions}
            placeholder="Closure Type"
            size="sm"
            allowClear
            clearLabel="All Closures"
            onChange={(event) =>
              onFilterChange({
                closureType: (event.target.value || undefined) as ClosedLeadFiltersState['closureType'],
              })
            }
          />
        </div>

        {/* Date From - To */}
        <div className="flex items-center gap-1.5">
          <div className="relative w-[130px]">
            <CalendarRange className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(event) => onFilterChange({ dateFrom: event.target.value || undefined })}
              className="h-9 w-full rounded-lg border border-gray-200/90 bg-gray-50/70 py-1 pl-7 pr-2 text-xs font-medium text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Closed from date"
              title="Closed from date"
            />
          </div>
          <span className="text-gray-400 text-xs">-</span>
          <div className="relative w-[130px]">
            <CalendarRange className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(event) => onFilterChange({ dateTo: event.target.value || undefined })}
              className="h-9 w-full rounded-lg border border-gray-200/90 bg-gray-50/70 py-1 pl-7 pr-2 text-xs font-medium text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Closed to date"
              title="Closed to date"
            />
          </div>
        </div>

        {/* Min / Max Revenue */}
        <div className="flex items-center gap-1.5">
          <div className="relative w-[100px]">
            <DollarSign className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              min="0"
              value={filters.minRevenue || ''}
              onChange={(event) => onFilterChange({ minRevenue: event.target.value || undefined })}
              placeholder="Min rev"
              className="h-9 w-full rounded-lg border border-gray-200/90 bg-gray-50/70 py-1 pl-6 pr-2 text-xs font-medium text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Min revenue"
            />
          </div>
          <span className="text-gray-400 text-xs">-</span>
          <div className="relative w-[100px]">
            <DollarSign className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              min="0"
              value={filters.maxRevenue || ''}
              onChange={(event) => onFilterChange({ maxRevenue: event.target.value || undefined })}
              placeholder="Max rev"
              className="h-9 w-full rounded-lg border border-gray-200/90 bg-gray-50/70 py-1 pl-6 pr-2 text-xs font-medium text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              aria-label="Max revenue"
            />
          </div>
        </div>

        {/* Reset */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="h-9 px-3 rounded-lg border border-gray-200/80 bg-gray-50/60 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-gray-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-auto"
            title="Reset filters"
          >
            <RotateCcw size={13} />
            <span>Reset ({activeCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(ClosedLeadFilters);
