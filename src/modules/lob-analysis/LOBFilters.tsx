import React from 'react';
import { Filter, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import OfficeFilterSelect from '../../components/OfficeFilterSelect';
import type { LOBAnalysisFilters } from './types/lobAnalysis.types';

interface Option {
  value: string;
  label: string;
}

interface LOBFiltersProps {
  filters: LOBAnalysisFilters;
  stageOptions: Option[];
  reasonOptions: Option[];
  userOptions: Option[];
  locationOptions: Option[];
  showOfficeFilter?: boolean;
  appliedChips?: string[];
  onChange: (patch: Partial<LOBAnalysisFilters>) => void;
  onSearchChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
}

const LOBFilters: React.FC<LOBFiltersProps> = ({
  filters,
  stageOptions,
  reasonOptions,
  userOptions,
  locationOptions,
  showOfficeFilter = false,
  appliedChips = [],
  onChange,
  onSearchChange,
  onApply,
  onReset,
}) => {
  const hasActiveFilters = appliedChips.length > 0;

  return (
    <section className="relative z-30 isolate rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs space-y-3">
      {/* Header with Title and Filter Status Pill */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80">
            <Filter size={14} />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-gray-900">LOB Analysis Scope</h2>
            <p className="text-[11px] text-gray-500">Refine by date range, exit stages, reasons, users, and location.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasActiveFilters ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{appliedChips.length} filter{appliedChips.length > 1 ? 's' : ''} active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-500 border border-gray-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              <span>No filters applied</span>
            </span>
          )}

          <div className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600 border border-gray-200/60">
            <SlidersHorizontal size={12} className="text-emerald-600" />
            <span>Dynamic filters</span>
          </div>
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={filters.search || ''}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search lead name, email, phone number..."
          className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50/70 pl-8.5 pr-3 text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
          aria-label="Search LOB records"
        />
      </div>

      {/* Filter Inputs Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Row 1: Date From, Date To, Previous Stage */}
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Date From</span>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(event) => onChange({ dateFrom: event.target.value })}
            className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3 text-xs font-medium text-gray-900 outline-none transition-all hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
          />
        </label>

        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Date To</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(event) => onChange({ dateTo: event.target.value })}
            className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3 text-xs font-medium text-gray-900 outline-none transition-all hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
          />
        </label>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Previous Stage</span>
          <SearchableSelect
            options={[{ value: '', label: 'All Stages' }, ...stageOptions]}
            value={filters.stage || ''}
            onChange={(event) => onChange({ stage: event.target.value || undefined })}
            placeholder="Choose stage"
            name="stage"
            size="sm"
          />
        </div>

        {/* Row 2: LOB Reason, Changed By, Region */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">LOB Reason</span>
          <SearchableSelect
            options={[{ value: '', label: 'All Reasons' }, ...reasonOptions]}
            value={filters.reasonId || ''}
            onChange={(event) => onChange({ reasonId: event.target.value || undefined })}
            placeholder="Choose reason"
            name="reasonId"
            size="sm"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Changed By</span>
          <SearchableSelect
            options={[{ value: '', label: 'All Users' }, ...userOptions]}
            value={filters.userId || ''}
            onChange={(event) => onChange({ userId: event.target.value || undefined })}
            placeholder="Choose user"
            name="userId"
            size="sm"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Region</span>
          <SearchableSelect
            options={[{ value: '', label: 'All Locations' }, ...locationOptions]}
            value={filters.locationId || ''}
            onChange={(event) => onChange({ locationId: event.target.value || undefined })}
            placeholder="Choose location"
            name="locationId"
            size="sm"
          />
        </div>

        {/* Optional Row 3: Office Location */}
        {showOfficeFilter && (
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Office Location</span>
            <OfficeFilterSelect
              value={filters.officeId || ''}
              onChange={(officeId) => onChange({ officeId })}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Applied Filter Chips inline */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">Active:</span>
          {appliedChips.map((chip) => (
            <span
              key={chip}
              className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1.5 h-8.5 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-gray-400" />
          <span>Reset</span>
        </button>
        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center justify-center gap-1.5 h-8.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Apply Filters</span>
        </button>
      </div>
    </section>
  );
};

export default LOBFilters;
