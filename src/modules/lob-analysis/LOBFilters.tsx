import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
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
  onChange: (patch: Partial<LOBAnalysisFilters>) => void;
  onApply: () => void;
  onReset: () => void;
}

const LOBFilters: React.FC<LOBFiltersProps> = ({
  filters,
  stageOptions,
  reasonOptions,
  userOptions,
  locationOptions,
  onChange,
  onApply,
  onReset,
}) => (
  <section className="relative z-30 isolate rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-500">Filters</p>
        <h2 className="mt-1 text-2xl font-black text-gray-900">LOB Analysis Scope</h2>
      </div>
      <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-500">
        <Filter className="h-4 w-4 text-emerald-500" />
        Dynamic filters
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <label className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Date From</span>
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(event) => onChange({ dateFrom: event.target.value })}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Date To</span>
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={(event) => onChange({ dateTo: event.target.value })}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Previous Stage</span>
        <SearchableSelect
          options={[{ value: '', label: 'All Stages' }, ...stageOptions]}
          value={filters.stage || ''}
          onChange={(event) => onChange({ stage: event.target.value || undefined })}
          placeholder="Choose stage"
          name="stage"
        />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">LOB Reason</span>
        <SearchableSelect
          options={[{ value: '', label: 'All Reasons' }, ...reasonOptions]}
          value={filters.reasonId || ''}
          onChange={(event) => onChange({ reasonId: event.target.value || undefined })}
          placeholder="Choose reason"
          name="reasonId"
        />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Changed By</span>
        <SearchableSelect
          options={[{ value: '', label: 'All Users' }, ...userOptions]}
          value={filters.userId || ''}
          onChange={(event) => onChange({ userId: event.target.value || undefined })}
          placeholder="Choose user"
          name="userId"
        />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Region / Office</span>
        <SearchableSelect
          options={[{ value: '', label: 'All Locations' }, ...locationOptions]}
          value={filters.locationId || ''}
          onChange={(event) => onChange({ locationId: event.target.value || undefined })}
          placeholder="Choose location"
          name="locationId"
        />
      </div>
    </div>

    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </button>
      <button
        type="button"
        onClick={onApply}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] transition hover:bg-emerald-600"
      >
        <Filter className="h-4 w-4" />
        Apply Filters
      </button>
    </div>
  </section>
);

export default LOBFilters;
