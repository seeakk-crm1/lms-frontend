import React from 'react';
import { CalendarRange, Filter, RotateCcw, Search } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type { ReportType } from '../../report-types/types/reportType.types';
import type { SavedReportFilters } from '../types/report.types';

type Option = { value: string; label: string };

interface ReportFiltersProps {
  search: string;
  draftFilters: SavedReportFilters;
  reportTypes: ReportType[];
  users: Option[];
  onSearchChange: (value: string) => void;
  onDraftChange: (patch: Partial<SavedReportFilters>) => void;
  onApply: () => void;
  onReset: () => void;
}

const booleanOptions: Option[] = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const statusOptions: Option[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
];

const ReportFilters: React.FC<ReportFiltersProps> = ({
  search,
  draftFilters,
  reportTypes,
  users,
  onSearchChange,
  onDraftChange,
  onApply,
  onReset,
}) => {
  const reportTypeOptions = reportTypes.map((item) => ({ value: item.id, label: item.name }));

  return (
    <section className="rounded-[28px] border border-white/60 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-500">Filters</p>
          <h2 className="mt-1 text-lg font-black text-gray-900">Find the Right Reports</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
          >
            <RotateCcw size={15} />
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-white shadow-[0_16px_32px_-18px_rgba(16,185,129,0.9)] transition hover:bg-emerald-600"
          >
            <Filter size={15} />
            Apply Filters
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <label className="lg:col-span-2">
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Search</span>
          <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <Search size={16} className="mr-3 text-gray-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by report name"
              className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Created By</span>
          <SearchableSelect
            options={users}
            value={draftFilters.createdBy || ''}
            onChange={(event) => onDraftChange({ createdBy: event.target.value })}
            placeholder="All creators"
            name="createdBy"
          />
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Report Type</span>
          <SearchableSelect
            options={reportTypeOptions}
            value={draftFilters.reportTypeId || ''}
            onChange={(event) => onDraftChange({ reportTypeId: event.target.value })}
            placeholder="All report types"
            name="reportTypeId"
          />
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Run Status</span>
          <SearchableSelect
            options={statusOptions}
            value={draftFilters.status || ''}
            onChange={(event) => onDraftChange({ status: event.target.value as SavedReportFilters['status'] })}
            placeholder="All statuses"
            name="status"
          />
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Active State</span>
          <SearchableSelect
            options={booleanOptions}
            value={draftFilters.isActive || ''}
            onChange={(event) => onDraftChange({ isActive: event.target.value as SavedReportFilters['isActive'] })}
            placeholder="All states"
            name="isActive"
          />
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Created From</span>
          <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <CalendarRange size={16} className="mr-3 text-gray-400" />
            <input
              type="date"
              value={draftFilters.createdAtFrom || ''}
              onChange={(event) => onDraftChange({ createdAtFrom: event.target.value })}
              className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none"
            />
          </div>
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Created To</span>
          <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <CalendarRange size={16} className="mr-3 text-gray-400" />
            <input
              type="date"
              value={draftFilters.createdAtTo || ''}
              onChange={(event) => onDraftChange({ createdAtTo: event.target.value })}
              className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none"
            />
          </div>
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Report Date From</span>
          <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <CalendarRange size={16} className="mr-3 text-gray-400" />
            <input
              type="date"
              value={draftFilters.reportDateFrom || ''}
              onChange={(event) => onDraftChange({ reportDateFrom: event.target.value })}
              className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none"
            />
          </div>
        </label>

        <label>
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Report Date To</span>
          <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <CalendarRange size={16} className="mr-3 text-gray-400" />
            <input
              type="date"
              value={draftFilters.reportDateTo || ''}
              onChange={(event) => onDraftChange({ reportDateTo: event.target.value })}
              className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none"
            />
          </div>
        </label>
      </div>
    </section>
  );
};

export default ReportFilters;
