import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, FilePlus2, X } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type { AllowedReportFilterKey, ReportType } from '../../report-types/types/reportType.types';
import type { SavedReport, SavedReportPayload } from '../types/report.types';

type Option = { value: string; label: string };

interface CreateReportModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  report: SavedReport | null;
  reportTypes: ReportType[];
  currentUserLabel: string;
  filterOptions: Record<AllowedReportFilterKey, Option[]>;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: SavedReportPayload) => Promise<void>;
}

type DraftFilterState = Record<AllowedReportFilterKey, { scalar: string; from: string; to: string }>;

const EMPTY_ALLOWED_FILTERS: AllowedReportFilterKey[] = [];

const filterLabels: Record<AllowedReportFilterKey, string> = {
  stage: 'Stage',
  assignee: 'Assignee',
  lead_source: 'Lead Source',
  created_date: 'Created Date',
  follow_up_date: 'Follow-up Date',
  role: 'Role',
  department: 'Department',
  office: 'Office',
  status: 'Status',
};

const isRangeFilter = (key: AllowedReportFilterKey) => key === 'created_date' || key === 'follow_up_date';

const CreateReportModal: React.FC<CreateReportModalProps> = ({
  open,
  mode,
  report,
  reportTypes,
  currentUserLabel,
  filterOptions,
  loading,
  onClose,
  onSubmit,
}) => {
  const [reportName, setReportName] = useState('');
  const [reportTypeId, setReportTypeId] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [filterDraft, setFilterDraft] = useState<DraftFilterState>({} as DraftFilterState);

  const selectedReportType = useMemo(
    () => reportTypes.find((item) => item.id === reportTypeId) || null,
    [reportTypeId, reportTypes],
  );

  const allowedFilters = useMemo(
    () => (selectedReportType?.allowedFilters ? [...selectedReportType.allowedFilters] : EMPTY_ALLOWED_FILTERS),
    [selectedReportType?.allowedFilters],
  );

  useEffect(() => {
    if (!open) return;

    if (report) {
      setReportName(report.reportName);
      setReportTypeId(report.reportTypeId);
      setReportDate(report.reportDate);
      setIsActive(report.isActive);

      const nextDraft = {} as DraftFilterState;
      report.filters.forEach((filter) => {
        if (isRangeFilter(filter.key)) {
          const value = (filter.value || {}) as { from?: string; to?: string };
          nextDraft[filter.key] = {
            scalar: '',
            from: value.from ? String(value.from).slice(0, 10) : '',
            to: value.to ? String(value.to).slice(0, 10) : '',
          };
        } else {
          const values = Array.isArray(filter.value) ? filter.value : [filter.value];
          nextDraft[filter.key] = {
            scalar: String(values[0] ?? ''),
            from: '',
            to: '',
          };
        }
      });
      setFilterDraft(nextDraft);
      return;
    }

    setReportName('');
    setReportTypeId('');
    setReportDate(new Date().toISOString().slice(0, 10));
    setIsActive(true);
    setFilterDraft({} as DraftFilterState);
  }, [open, report]);

  useEffect(() => {
    setFilterDraft((current) => {
      const next = Object.fromEntries(
        Object.entries(current).filter(([key]) => allowedFilters.includes(key as AllowedReportFilterKey)),
      ) as DraftFilterState;

      const currentKeys = Object.keys(current).sort();
      const nextKeys = Object.keys(next).sort();

      if (
        currentKeys.length === nextKeys.length &&
        currentKeys.every((key, index) => key === nextKeys[index])
      ) {
        return current;
      }

      return next;
    });
  }, [allowedFilters]);

  const handleSubmit = async () => {
    const payloadFilters = allowedFilters
      .map((key) => {
        const value = filterDraft[key];
        if (!value) return null;

        if (isRangeFilter(key)) {
          if (!value.from && !value.to) return null;
          return {
            key,
            value: {
              from: value.from || undefined,
              to: value.to || undefined,
            },
          };
        }

        if (!value.scalar.trim()) return null;
        return {
          key,
          value: [value.scalar],
        };
      })
      .filter(Boolean) as SavedReportPayload['filters'];

    await onSubmit({
      reportName: reportName.trim(),
      reportTypeId,
      reportDate,
      isActive,
      filters: payloadFilters,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_40px_120px_-45px_rgba(15,23,42,0.45)]"
          >
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-emerald-600">
                  <FilePlus2 size={14} />
                  {mode === 'edit' ? 'Edit Report' : 'Create Report'}
                </p>
                <h2 className="mt-3 text-3xl font-black text-gray-900">
                  {mode === 'edit' ? 'Update Saved Report' : 'Create Saved Report'}
                </h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold text-gray-500">
                  Save a reusable report instance, attach dynamic filters, and generate it whenever the team needs a fresh export.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-170px)] overflow-y-auto px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Report Name</span>
                  <input
                    value={reportName}
                    onChange={(event) => setReportName(event.target.value)}
                    placeholder="Daily Sales Report"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Report Type</span>
                  <SearchableSelect
                    options={reportTypes.map((item) => ({ value: item.id, label: item.name }))}
                    value={reportTypeId}
                    onChange={(event) => setReportTypeId(event.target.value)}
                    placeholder="Choose report type"
                    name="reportTypeId"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Report Date</span>
                  <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <Calendar size={16} className="mr-3 text-gray-400" />
                    <input
                      type="date"
                      value={reportDate}
                      onChange={(event) => setReportDate(event.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-gray-700 outline-none"
                    />
                  </div>
                </label>

                <label>
                  <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Created By</span>
                  <input
                    value={currentUserLabel}
                    disabled
                    className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 outline-none"
                  />
                </label>
              </div>

              <div className="mt-5 rounded-[28px] border border-gray-100 bg-gray-50/80 p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-500">Dynamic Filters</p>
                    <h3 className="mt-1 text-lg font-black text-gray-900">Renderer Driven by Report Type</h3>
                  </div>

                  <label className="inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600">
                    <span>Status</span>
                    <button
                      type="button"
                      onClick={() => setIsActive((value) => !value)}
                      className={`relative h-7 w-14 rounded-full transition ${isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${isActive ? 'left-8' : 'left-1'}`}
                      />
                    </button>
                    <span className={isActive ? 'text-emerald-600' : 'text-gray-500'}>{isActive ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>

                {!selectedReportType ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center text-sm font-semibold text-gray-500">
                    Select a report type to load its allowed filters.
                  </div>
                ) : allowedFilters.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center text-sm font-semibold text-gray-500">
                    This report type does not require additional filters.
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {allowedFilters.map((key) => {
                      const current = filterDraft[key] || { scalar: '', from: '', to: '' };

                      if (isRangeFilter(key)) {
                        return (
                          <div key={key} className="rounded-2xl border border-white bg-white p-4">
                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">{filterLabels[key]}</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              <input
                                type="date"
                                value={current.from}
                                onChange={(event) =>
                                  setFilterDraft((state) => ({
                                    ...state,
                                    [key]: { ...current, from: event.target.value },
                                  }))
                                }
                                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                              />
                              <input
                                type="date"
                                value={current.to}
                                onChange={(event) =>
                                  setFilterDraft((state) => ({
                                    ...state,
                                    [key]: { ...current, to: event.target.value },
                                  }))
                                }
                                className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                              />
                            </div>
                          </div>
                        );
                      }

                      const options = filterOptions[key] || [];
                      return (
                        <div key={key} className="rounded-2xl border border-white bg-white p-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">{filterLabels[key]}</p>
                          <div className="mt-3">
                            {options.length > 0 ? (
                              <SearchableSelect
                                options={options}
                                value={current.scalar}
                                onChange={(event) =>
                                  setFilterDraft((state) => ({
                                    ...state,
                                    [key]: { ...current, scalar: event.target.value },
                                  }))
                                }
                                placeholder={`Select ${filterLabels[key]}`}
                                name={key}
                              />
                            ) : (
                              <input
                                value={current.scalar}
                                onChange={(event) =>
                                  setFilterDraft((state) => ({
                                    ...state,
                                    [key]: { ...current, scalar: event.target.value },
                                  }))
                                }
                                placeholder={`Enter ${filterLabels[key]}`}
                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !reportName.trim() || !reportTypeId || !reportDate}
                onClick={handleSubmit}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_35px_-18px_rgba(16,185,129,0.95)] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Create Report'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateReportModal;
