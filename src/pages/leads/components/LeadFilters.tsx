import React, { memo, useMemo } from 'react';
import { CalendarRange, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import OfficeFilterSelect from '../../../components/OfficeFilterSelect';
import type { LeadFilters as LeadFiltersState, LeadMetaOptions } from '../../../types/lead.types';

interface LeadFiltersProps {
  search: string;
  filters: LeadFiltersState;
  meta?: LeadMetaOptions;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: Partial<LeadFiltersState>) => void;
  onReset: () => void;
  showOfficeFilter?: boolean;
}

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'LOB', label: 'LOB' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const starredOptions = [
  { value: 'ALL', label: 'All Leads' },
  { value: 'STARRED', label: 'Starred Leads' },
  { value: 'DUPLICATES', label: 'Duplicate Leads' },
];

const LeadFilters: React.FC<LeadFiltersProps> = ({
  search,
  filters,
  meta,
  onSearchChange,
  onFilterChange,
  onReset,
  showOfficeFilter = false,
}) => {
  // Count active filters
  const activeCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count += 1;
    if (filters.stage) count += 1;
    if (filters.assignedTo) count += 1;
    if (filters.source) count += 1;
    if (filters.officeId) count += 1;
    if (filters.status) count += 1;
    if (filters.starred && filters.starred !== 'ALL') count += 1;
    if (filters.createdFrom) count += 1;
    if (filters.createdTo) count += 1;
    return count;
  }, [filters, search]);

  const activeStageLabel = useMemo(
    () => meta?.stages?.find((s) => s.id === filters.stage)?.label,
    [meta?.stages, filters.stage],
  );

  const activeUserLabel = useMemo(
    () => meta?.users?.find((u) => u.id === filters.assignedTo)?.label,
    [meta?.users, filters.assignedTo],
  );

  const activeSourceLabel = useMemo(
    () => meta?.sources?.find((s) => s.id === filters.source)?.label,
    [meta?.sources, filters.source],
  );

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-3 shadow-xs space-y-2.5">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search leads..."
            className="h-9 w-full rounded-lg border border-gray-200/90 bg-gray-50/70 py-1.5 pl-8 pr-7 text-xs font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            aria-label="Search leads"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Stage Filter */}
        <div className="w-[130px] sm:w-[140px]">
          <SearchableSelect
            name="stage"
            value={filters.stage || ''}
            options={(meta?.stages || []).map((item) => ({ value: item.id, label: item.label, color: item.color }))}
            placeholder="Stage"
            size="sm"
            allowClear
            clearLabel="All Stages"
            onChange={(event) => onFilterChange({ stage: event.target.value || undefined })}
          />
        </div>

        {/* Assigned User Filter */}
        <div className="w-[140px] sm:w-[150px]">
          <SearchableSelect
            name="assignedTo"
            value={filters.assignedTo || ''}
            options={(meta?.users || []).map((item) => ({ value: item.id, label: item.label }))}
            placeholder="Assigned To"
            size="sm"
            allowClear
            clearLabel="All Users"
            onChange={(event) => onFilterChange({ assignedTo: event.target.value || undefined })}
          />
        </div>

        {/* Source Filter */}
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

        {/* Office Filter (if authorized) */}
        {showOfficeFilter && (
          <div className="w-[140px] sm:w-[155px]">
            <OfficeFilterSelect
              value={filters.officeId || ''}
              size="sm"
              onChange={(officeId) => onFilterChange({ officeId })}
            />
          </div>
        )}

        {/* Status Filter */}
        <div className="w-[110px] sm:w-[120px]">
          <SearchableSelect
            name="status"
            value={filters.status || ''}
            options={statusOptions}
            placeholder="Status"
            size="sm"
            allowClear
            clearLabel="All Statuses"
            onChange={(event) =>
              onFilterChange({
                status: (event.target.value || undefined) as LeadFiltersState['status'],
              })
            }
          />
        </div>

        {/* Starred / Type Filter */}
        <div className="w-[125px] sm:w-[135px]">
          <SearchableSelect
            name="starred"
            value={filters.starred || 'ALL'}
            options={starredOptions}
            placeholder="Lead Type"
            size="sm"
            onChange={(event) =>
              onFilterChange({
                starred: (event.target.value || 'ALL') as LeadFiltersState['starred'],
              })
            }
          />
        </div>

        {/* Date Range Group */}
        <div className="flex items-center gap-1.5">
          <div className="relative w-[130px]">
            <CalendarRange className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filters.createdFrom || ''}
              onChange={(event) => onFilterChange({ createdFrom: event.target.value || undefined })}
              className="h-9 w-full rounded-lg border border-gray-200/90 bg-gray-50/70 py-1 pl-7 pr-2 text-xs font-medium text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              aria-label="From date"
              title="Created from date"
            />
          </div>
          <span className="text-gray-400 text-xs">-</span>
          <div className="relative w-[130px]">
            <CalendarRange className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={filters.createdTo || ''}
              onChange={(event) => onFilterChange({ createdTo: event.target.value || undefined })}
              className="h-9 w-full rounded-lg border border-gray-200/90 bg-gray-50/70 py-1 pl-7 pr-2 text-xs font-medium text-gray-900 outline-none transition-all hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              aria-label="To date"
              title="Created to date"
            />
          </div>
        </div>

        {/* Reset Button */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="h-9 px-3 rounded-lg border border-gray-200/80 bg-gray-50/60 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-gray-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-auto"
            title="Reset all filters"
          >
            <RotateCcw size={13} />
            <span>Reset ({activeCount})</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips (Progressive disclosure of selected filters) */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">Active:</span>

          {search.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs">
              Search: "{search}"
              <button type="button" onClick={() => onSearchChange('')} className="hover:text-emerald-900">
                <X size={11} />
              </button>
            </span>
          )}

          {filters.stage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs">
              Stage: {activeStageLabel || filters.stage}
              <button type="button" onClick={() => onFilterChange({ stage: undefined })} className="hover:text-emerald-900">
                <X size={11} />
              </button>
            </span>
          )}

          {filters.assignedTo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs">
              Assigned: {activeUserLabel || filters.assignedTo}
              <button type="button" onClick={() => onFilterChange({ assignedTo: undefined })} className="hover:text-emerald-900">
                <X size={11} />
              </button>
            </span>
          )}

          {filters.source && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs">
              Source: {activeSourceLabel || filters.source}
              <button type="button" onClick={() => onFilterChange({ source: undefined })} className="hover:text-emerald-900">
                <X size={11} />
              </button>
            </span>
          )}

          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs">
              Status: {filters.status}
              <button type="button" onClick={() => onFilterChange({ status: undefined })} className="hover:text-emerald-900">
                <X size={11} />
              </button>
            </span>
          )}

          {filters.starred && filters.starred !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs">
              Type: {filters.starred === 'STARRED' ? 'Starred' : 'Duplicates'}
              <button type="button" onClick={() => onFilterChange({ starred: 'ALL' })} className="hover:text-emerald-900">
                <X size={11} />
              </button>
            </span>
          )}

          {(filters.createdFrom || filters.createdTo) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 text-xs">
              Date: {filters.createdFrom || 'Any'} to {filters.createdTo || 'Any'}
              <button type="button" onClick={() => onFilterChange({ createdFrom: undefined, createdTo: undefined })} className="hover:text-emerald-900">
                <X size={11} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-bold text-gray-400 hover:text-gray-700 underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default memo(LeadFilters);
