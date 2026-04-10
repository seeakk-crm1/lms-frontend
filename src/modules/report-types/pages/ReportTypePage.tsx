import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Filter, LayoutList, Plus, Search, Sparkles } from 'lucide-react';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import SearchableSelect from '../../../components/SearchableSelect';
import { useLeadMetaQuery } from '../../../hooks/useLeads';
import { useDepartmentsQuery, useRolesQuery } from '../../../hooks/useUsersQuery';
import { useOfficesQuery } from '../../../hooks/admin/office/useOfficeQuery';
import useAuthStore from '../../../store/useAuthStore';
import { useCreateReportType } from '../hooks/useCreateReportType';
import { useReportTypesQuery } from '../hooks/useReportTypesQuery';
import { useDeleteReportType, useGenerateReport, useToggleReportType } from '../hooks/useToggleReportType';
import { useUpdateReportType } from '../hooks/useUpdateReportType';
import useReportTypeStore from '../store/reportTypeStore';
import DeleteReportTypeModal from '../components/DeleteReportTypeModal';
import ReportTypeTable from '../components/ReportTypeTable';
import type {
  AllowedReportFilterKey,
  ReportExecutionFilter,
  ReportModule,
  ReportType,
  ReportTypePayload,
  ReportTypeStatus,
} from '../types/reportType.types';

const ReportTypeModal = lazy(() => import('../components/ReportTypeModal'));

const roleKey = (role: unknown) =>
  String(typeof role === 'object' && role !== null ? (role as { name?: string }).name || '' : role || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '');

const moduleOptions: Array<{ value: ReportModule; label: string }> = [
  { value: 'LEADS', label: 'Leads' },
  { value: 'USERS', label: 'Users' },
  { value: 'REPORTS', label: 'Reports' },
  { value: 'TARGETS', label: 'Targets' },
  { value: 'FOLLOWUPS', label: 'Follow-ups' },
];

const statusOptions: Array<{ value: ReportTypeStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const filterFieldLabels: Record<AllowedReportFilterKey, string> = {
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

const statusFilterOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
];

const ResultTable: React.FC<{ rows: Array<Record<string, unknown>> }> = ({ rows }) => {
  const columns = Object.keys(rows[0] || {});
  if (!rows.length) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-10 text-center text-sm font-semibold text-gray-500">
        No report rows were returned for the current filter set.
      </div>
    );
  }

  return (
    <div>
      <div className="hidden overflow-x-auto rounded-3xl border border-gray-100 md:block">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr className="text-left text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
              {columns.map((column) => (
                <th key={column} className="px-4 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-gray-100 text-sm font-semibold text-gray-700">
                {columns.map((column) => (
                  <td key={column} className="px-4 py-3">
                    {String(row[column] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="grid gap-3">
              {columns.map((column) => (
                <div key={column}>
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">{column}</div>
                  <div className="mt-1 text-sm font-semibold text-gray-700 break-words">{String(row[column] ?? '-')}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportTypePage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setMobileMenuOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReportType, setModalReportType] = useState<ReportType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReportType | null>(null);
  const [executorDraft, setExecutorDraft] = useState<Record<string, { scalar: string; from: string; to: string }>>({});

  const { user } = useAuthStore();
  const { search, filters, selected, page, limit, setSearch, setFilters, setSelected, resetFilters, setPage } = useReportTypeStore();
  const reportTypesQuery = useReportTypesQuery();
  const createMutation = useCreateReportType();
  const updateMutation = useUpdateReportType();
  const toggleMutation = useToggleReportType();
  const deleteMutation = useDeleteReportType();
  const generateMutation = useGenerateReport();
  const leadMetaQuery = useLeadMetaQuery();
  const rolesQuery = useRolesQuery();
  const departmentsQuery = useDepartmentsQuery();
  const officesQuery = useOfficesQuery();

  const canManage = ['admin', 'superadmin'].includes(roleKey(user?.role));

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchDraft), 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, setSearch]);

  const rows = reportTypesQuery.data?.data || [];
  const pagination = reportTypesQuery.data?.pagination;

  const selectedSummary = useMemo(
    () =>
      rows.find((item) => item.id === selected?.id) ||
      selected ||
      rows[0] ||
      null,
    [rows, selected],
  );

  const handleSave = async (payload: ReportTypePayload) => {
    try {
      if (modalReportType?.id) {
        await updateMutation.mutateAsync({ id: modalReportType.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
      setModalReportType(null);
    } catch {
      // Keep the modal open so the user can correct the form after a failed request.
    }
  };

  const appliedFilterChips = useMemo(
    () =>
      [
        search ? `Search: ${search}` : null,
        filters.status ? `Status: ${filters.status}` : null,
        filters.module ? `Module: ${filters.module}` : null,
      ].filter(Boolean) as string[],
    [filters.module, filters.status, search],
  );

  const reportFilters = useMemo(() => selectedSummary?.allowedFilters || [], [selectedSummary]);

  useEffect(() => {
    setExecutorDraft((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => reportFilters.includes(key as AllowedReportFilterKey))),
    );
  }, [reportFilters]);

  const roleOptions = useMemo(
    () =>
      ((rolesQuery.data?.roles || []) as Array<{ id?: string; name?: string }>)
        .filter((role) => role?.id)
        .map((role) => ({ value: role.id as string, label: role.name || role.id || 'Unknown Role' })),
    [rolesQuery.data],
  );

  const departmentOptions = useMemo(
    () => {
      const departments = Array.isArray(departmentsQuery.data)
        ? departmentsQuery.data
        : departmentsQuery.data?.departments || [];
      return (departments as Array<{ id?: string; name?: string }>)
        .filter((department) => department?.id)
        .map((department) => ({
          value: department.id as string,
          label: department.name || department.id || 'Unknown Department',
        }));
    },
    [departmentsQuery.data],
  );

  const officeOptions = useMemo(
    () =>
      ((officesQuery.data?.data?.offices || []) as Array<{ id?: string; name?: string; isActive?: boolean }>)
        .filter((office) => office?.id && office?.isActive !== false)
        .map((office) => ({ value: office.id as string, label: office.name || office.id || 'Unknown Office' })),
    [officesQuery.data],
  );

  const executionOptions = useMemo<Record<AllowedReportFilterKey, Array<{ value: string; label: string }>>>(
    () => ({
      stage: (leadMetaQuery.data?.stages || []).map((item) => ({ value: item.id, label: item.label })),
      assignee: (leadMetaQuery.data?.users || []).map((item) => ({ value: item.id, label: item.label })),
      lead_source: (leadMetaQuery.data?.sources || []).map((item) => ({ value: item.id, label: item.label })),
      created_date: [],
      follow_up_date: [],
      role: roleOptions,
      department: departmentOptions,
      office: officeOptions,
      status: statusFilterOptions,
    }),
    [departmentOptions, leadMetaQuery.data, officeOptions, roleOptions],
  );

  const buildExecutionFilters = (): ReportExecutionFilter[] =>
    reportFilters
      .map((filterKey) => {
        const value = executorDraft[filterKey];
        if (!value) return null;

        if (filterKey === 'created_date' || filterKey === 'follow_up_date') {
          if (!value.from && !value.to) return null;
          return {
            key: filterKey,
            value: {
              from: value.from || undefined,
              to: value.to || undefined,
            },
          };
        }

        if (!value.scalar.trim()) return null;
        return {
          key: filterKey,
          value: value.scalar
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        };
      })
      .filter(Boolean) as ReportExecutionFilter[];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans text-gray-900">
      <DashboardSidebar isCollapsed={isSidebarCollapsed} toggleCollapsed={() => setIsSidebarCollapsed((value) => !value)} />

      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        <DashboardHeader setMobileMenuOpen={setMobileMenuOpen} />

        <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-4 md:p-8">
          <div className="absolute right-0 top-0 -z-10 h-[440px] w-[760px] bg-gradient-to-bl from-emerald-50 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1520px] space-y-6 md:space-y-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-emerald-600">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Dynamic Report Engine</span>
                </div>
                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Report Type Management</h1>
                <p className="mt-2 max-w-3xl text-sm font-semibold text-gray-500">
                  Configure reusable report templates, control which filters are allowed, and generate live result sets without hard-coded screens.
                </p>
              </motion.div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_220px_auto]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Search report types"
                    className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <SearchableSelect
                  options={[{ value: '', label: 'All Statuses' }, ...statusOptions]}
                  value={filters.status || ''}
                  onChange={(event) => setFilters({ status: event.target.value as ReportTypeStatus | '' })}
                  placeholder="Filter status"
                  name="status"
                />

                <SearchableSelect
                  options={[{ value: '', label: 'All Modules' }, ...moduleOptions]}
                  value={filters.module || ''}
                  onChange={(event) => setFilters({ module: event.target.value as ReportModule | '' })}
                  placeholder="Filter module"
                  name="module"
                />

                {canManage ? (
                  <button
                    type="button"
                    onClick={() => {
                      setModalReportType(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] transition-all hover:bg-emerald-600 sm:col-span-2 xl:col-span-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Report Type
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm">
                <Filter className="h-4 w-4 text-gray-400" />
                <span>{appliedFilterChips.length ? 'Filters applied' : 'No filters applied'}</span>
              </div>
              {appliedFilterChips.map((chip) => (
                <span key={chip} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600">
                  {chip}
                </span>
              ))}
              {appliedFilterChips.length ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                  Reset
                </button>
              ) : null}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Report Types</h2>
                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    Maintain report templates for leads, users, follow-ups, and other reporting surfaces.
                  </p>
                </div>
                <div className="self-start rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600 sm:self-auto">
                  {pagination?.total || 0} configured
                </div>
              </div>

              <ReportTypeTable
                rows={rows}
                loading={reportTypesQuery.isLoading}
                canManage={canManage}
                onEdit={(reportType) => {
                  setModalReportType(reportType);
                  setIsModalOpen(true);
                }}
                onToggleStatus={(reportType) => {
                  const nextStatus: ReportTypeStatus = reportType.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                  toggleMutation.mutate({ id: reportType.id, status: nextStatus });
                }}
                onDelete={(reportType) => {
                  setDeleteTarget(reportType);
                }}
                onRun={(reportType) => setSelected(reportType)}
              />

              {!reportTypesQuery.isLoading && !rows.length && canManage ? (
                <div className="mt-5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setModalReportType(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] transition-all hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4" />
                    Add Report Type
                  </button>
                </div>
              ) : null}

              {pagination && pagination.totalPages > 1 ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm font-semibold text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">Report Usage Flow</span>
                </div>
                <h3 className="text-xl font-black text-gray-900">Run selected report</h3>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Choose a configured report type, fill only the allowed filters, and generate a live result set from the backend engine.
                </p>

                {selectedSummary ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <div className="text-sm font-black text-gray-900">{selectedSummary.name}</div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                        {selectedSummary.module} • {selectedSummary.baseDataSource}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reportFilters.map((filterKey) => (
                        <div key={filterKey} className="space-y-2">
                          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">
                            {filterFieldLabels[filterKey]}
                          </div>
                          {filterKey === 'created_date' || filterKey === 'follow_up_date' ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                              <input
                                type="date"
                                value={executorDraft[filterKey]?.from || ''}
                                onChange={(event) =>
                                  setExecutorDraft((state) => ({
                                    ...state,
                                    [filterKey]: {
                                      scalar: '',
                                      from: event.target.value,
                                      to: state[filterKey]?.to || '',
                                    },
                                  }))
                                }
                                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                              />
                              <input
                                type="date"
                                value={executorDraft[filterKey]?.to || ''}
                                onChange={(event) =>
                                  setExecutorDraft((state) => ({
                                    ...state,
                                    [filterKey]: {
                                      scalar: '',
                                      from: state[filterKey]?.from || '',
                                      to: event.target.value,
                                    },
                                  }))
                                }
                                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                              />
                            </div>
                          ) : executionOptions[filterKey]?.length ? (
                            <SearchableSelect
                              options={executionOptions[filterKey]}
                              value={executorDraft[filterKey]?.scalar || ''}
                              onChange={(event) =>
                                setExecutorDraft((state) => ({
                                  ...state,
                                  [filterKey]: {
                                    scalar: event.target.value,
                                    from: '',
                                    to: '',
                                  },
                                }))
                              }
                              placeholder={`Select ${filterFieldLabels[filterKey]}`}
                              name={filterKey}
                            />
                          ) : (
                            <input
                              value={executorDraft[filterKey]?.scalar || ''}
                              onChange={(event) =>
                                setExecutorDraft((state) => ({
                                  ...state,
                                  [filterKey]: {
                                    scalar: event.target.value,
                                    from: '',
                                    to: '',
                                  },
                                }))
                              }
                              placeholder="Enter comma separated values"
                              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm outline-none placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        generateMutation.mutate({
                          reportTypeId: selectedSummary.id,
                          filters: buildExecutionFilters(),
                          page: 1,
                          limit: 25,
                        })
                      }
                      disabled={generateMutation.isPending || selectedSummary.status !== 'ACTIVE'}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      <LayoutList className="h-4 w-4" />
                      {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
                    </button>
                    {selectedSummary.status !== 'ACTIVE' ? (
                      <p className="text-xs font-bold text-amber-600">Only active report types can be executed.</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-5 py-8 text-center text-sm font-semibold text-gray-500">
                    Select a report type from the list to configure and run dynamic filters.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Generated Results</h3>
                    <p className="mt-1 text-sm font-semibold text-gray-500">Preview the result set returned by the report execution API.</p>
                  </div>
                  {generateMutation.data?.pagination ? (
                    <div className="self-start rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600 sm:self-auto">
                      {generateMutation.data.pagination.total} rows
                    </div>
                  ) : null}
                </div>

                {generateMutation.isError ? (
                  <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                    {String((generateMutation.error as any)?.response?.data?.message || generateMutation.error?.message || 'Failed to generate report')}
                  </div>
                ) : null}

                {generateMutation.isPending ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-12 animate-pulse rounded-2xl bg-gray-100" />
                    ))}
                  </div>
                ) : generateMutation.data ? (
                  <ResultTable rows={generateMutation.data.rows} />
                ) : (
                  <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-14 text-center">
                    <div className="text-lg font-black text-gray-900">No report executed yet</div>
                    <p className="mt-2 text-sm font-semibold text-gray-500">
                      Pick a report type, apply one or more allowed filters, and generate a live preview here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <ReportTypeModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalReportType(null);
          }}
          initialValue={modalReportType}
          onSubmit={handleSave}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Suspense>

      <DeleteReportTypeModal
        open={Boolean(deleteTarget)}
        reportType={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ReportTypePage;
