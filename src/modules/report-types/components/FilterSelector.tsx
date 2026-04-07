import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type { AllowedReportFilterKey, ReportBaseDataSource } from '../types/reportType.types';

const FILTER_OPTIONS: Array<{ value: AllowedReportFilterKey; label: string }> = [
  { value: 'stage', label: 'Stage' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'lead_source', label: 'Lead Source' },
  { value: 'created_date', label: 'Created Date' },
  { value: 'follow_up_date', label: 'Follow-up Date' },
  { value: 'role', label: 'Role' },
  { value: 'department', label: 'Department' },
  { value: 'office', label: 'Office' },
  { value: 'status', label: 'Status' },
];

const FILTERS_BY_SOURCE: Record<ReportBaseDataSource, AllowedReportFilterKey[]> = {
  LEADS: ['stage', 'assignee', 'lead_source', 'created_date', 'follow_up_date'],
  USERS: ['created_date', 'role', 'department', 'office', 'status'],
  FOLLOWUPS: ['stage', 'assignee', 'lead_source', 'created_date', 'follow_up_date', 'status'],
};

interface FilterSelectorProps {
  value: AllowedReportFilterKey[];
  onChange: (next: AllowedReportFilterKey[]) => void;
  baseDataSource?: ReportBaseDataSource | '';
}

const FilterSelector: React.FC<FilterSelectorProps> = ({ value, onChange, baseDataSource }) => {
  const [draft, setDraft] = useState('');

  const supportedFilters = useMemo(
    () => (baseDataSource ? FILTERS_BY_SOURCE[baseDataSource] : []),
    [baseDataSource],
  );

  const availableOptions = useMemo(
    () =>
      FILTER_OPTIONS.filter(
        (option) => supportedFilters.includes(option.value) && !value.includes(option.value),
      ),
    [supportedFilters, value],
  );

  const addFilter = () => {
    if (!draft || value.includes(draft as AllowedReportFilterKey) || value.length >= 10) return;
    onChange([...value, draft as AllowedReportFilterKey]);
    setDraft('');
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <SearchableSelect
          options={availableOptions}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={baseDataSource ? 'Select filter' : 'Select data source first'}
          name="report-filter"
        />
        <button
          type="button"
          onClick={addFilter}
          disabled={!draft || value.length >= 10 || !baseDataSource}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white shadow-[0_16px_30px_-16px_rgba(16,185,129,0.8)] transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Plus className="h-4 w-4" />
          Add Filter
        </button>
      </div>

      <div className="flex min-h-11 flex-wrap gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-3">
        <AnimatePresence initial={false}>
          {value.map((filter) => {
            const label = FILTER_OPTIONS.find((option) => option.value === filter)?.label || filter;
            return (
              <motion.button
                key={filter}
                type="button"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                onClick={() => onChange(value.filter((item) => item !== filter))}
                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black text-gray-700 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200"
              >
                <span>{label}</span>
                <X className="h-3.5 w-3.5" />
              </motion.button>
            );
          })}
        </AnimatePresence>
        {!value.length ? (
          <span className="self-center text-sm font-semibold text-gray-400">
            {baseDataSource
              ? 'Choose up to 10 filters for this report type.'
              : 'Pick a base data source first to unlock matching filters.'}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default FilterSelector;
