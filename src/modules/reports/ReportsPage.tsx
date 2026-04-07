import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DownloadCloud, FileBarChart2, Filter, Plus, RefreshCcw } from 'lucide-react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import { useLeadMetaQuery } from '../../hooks/useLeads';
import { useDepartmentsQuery, useRolesQuery } from '../../hooks/useUsersQuery';
import { useOfficesQuery } from '../../hooks/admin/office/useOfficeQuery';
import useAuthStore from '../../store/useAuthStore';
import type { AllowedReportFilterKey } from '../report-types/types/reportType.types';
import CreateReportModal from './components/CreateReportModal';
import ReportFilters from './components/ReportFilters';
import ReportsTable from './components/ReportsTable';
import {
  useActiveReportTypesQuery,
  useCreateReportMutation,
  useDeleteReportMutation,
  useDownloadReportMutation,
  useGenerateReportMutation,
  useReportsQuery,
  useUpdateReportMutation,
} from './hooks/useReports';
import useReportStore from './store/reportStore';
import type { SavedReport, SavedReportFilters, SavedReportPayload } from './types/report.types';

const roleKey = (role: unknown) =>
  String(typeof role === 'object' && role !== null ? (role as { name?: string }).name || '' : role || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '');

const ReportsPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setMobileMenuOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState('');
  const [draftFilters, setDraftFilters] = useState<SavedReportFilters>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [deleteTarget, setDeleteTarget] = useState<SavedReport | null>(null);

  const { user } = useAuthStore();
  const { search, filters, page, limit, selected, setSearch, setFilters, resetFilters, setPage, setSelected } = useReportStore();

  const reportsQuery = useReportsQuery();
  const reportTypesQuery = useActiveReportTypesQuery();
  const createMutation = useCreateReportMutation();
  const updateMutation = useUpdateReportMutation();
  const generateMutation = useGenerateReportMutation();
  const downloadMutation = useDownloadReportMutation();
  const deleteMutation = useDeleteReportMutation();
  const leadMetaQuery = useLeadMetaQuery();
  const rolesQuery = useRolesQuery();
  const departmentsQuery = useDepartmentsQuery();
  const officesQuery = useOfficesQuery();

  const canManage = ['admin', 'superadmin'].includes(roleKey(user?.role));

  useEffect(() => {
    setDraftSearch(search);
  }, [search]);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const reportTypes = reportTypesQuery.data?.data || [];
  const reports = reportsQuery.data?.data || [];
  const pagination = reportsQuery.data?.pagination;

  const userOptions = useMemo(
    () => (leadMetaQuery.data?.users || []).map((item) => ({ value: item.id, label: item.label })),
    [leadMetaQuery.data],
  );

  const roleOptions = useMemo(
    () =>
      ((rolesQuery.data?.roles || []) as Array<{ id?: string; name?: string }>)
        .filter((role) => role?.id)
        .map((role) => ({ value: role.id as string, label: role.name || role.id || 'Unknown Role' })),
    [rolesQuery.data],
  );

  const departmentOptions = useMemo(() => {
    const departments = Array.isArray(departmentsQuery.data)
      ? departmentsQuery.data
      : departmentsQuery.data?.departments || [];

    return (departments as Array<{ id?: string; name?: string }>)
      .filter((department) => department?.id)
      .map((department) => ({ value: department.id as string, label: department.name || department.id || 'Unknown Department' }));
  }, [departmentsQuery.data]);

  const officeOptions = useMemo(
    () =>
      ((officesQuery.data?.data?.offices || []) as Array<{ id?: string; name?: string; isActive?: boolean }>)
        .filter((office) => office?.id && office?.isActive !== false)
        .map((office) => ({ value: office.id as string, label: office.name || office.id || 'Unknown Office' })),
    [officesQuery.data],
  );

  const filterOptions = useMemo<Record<AllowedReportFilterKey, Array<{ value: string; label: string }>>>(
    () => ({
      stage: (leadMetaQuery.data?.stages || []).map((item) => ({ value: item.id, label: item.label })),
      assignee: userOptions,
      lead_source: (leadMetaQuery.data?.sources || []).map((item) => ({ value: item.id, label: item.label })),
      created_date: [],
      follow_up_date: [],
      role: roleOptions,
      department: departmentOptions,
      office: officeOptions,
      status: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'COMPLETED', label: 'Completed' },
      ],
    }),
    [departmentOptions, leadMetaQuery.data, officeOptions, roleOptions, userOptions],
  );

  const statCards = useMemo(() => {
    const total = pagination?.total || 0;
    const completed = reports.filter((item) => item.isGenerated).length;
    const pending = reports.filter((item) => !item.isGenerated).length;
    const active = reports.filter((item) => item.isActive).length;

    return [
      { label: 'Total Reports', value: total, accent: 'from-emerald-500/20 to-teal-500/5' },
      { label: 'Completed', value: completed, accent: 'from-emerald-500/20 to-emerald-100/20' },
      { label: 'Pending', value: pending, accent: 'from-amber-500/20 to-amber-100/20' },
      { label: 'Active', value: active, accent: 'from-sky-500/20 to-cyan-100/20' },
    ];
  }, [pagination?.total, reports]);

  const currentUserLabel = user?.name || user?.email || 'Current User';

  const handleApplyFilters = () => {
    setSearch(draftSearch.trim());
    setFilters(draftFilters);
  };

  const handleResetFilters = () => {
    setDraftSearch('');
    setDraftFilters({
      createdBy: '',
      status: '',
      isActive: '',
      reportTypeId: '',
      createdAtFrom: '',
      createdAtTo: '',
      reportDateFrom: '',
      reportDateTo: '',
    });
    resetFilters();
  };

  const handleSubmitModal = async (payload: SavedReportPayload) => {
    if (modalMode === 'edit' && selected?.id) {
      await updateMutation.mutateAsync({ id: selected.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsModalOpen(false);
    setSelected(null);
  };

  const openCreate = () => {
    setModalMode('create');
    setSelected(null);
    setIsModalOpen(true);
  };

  const openEdit = (report: SavedReport) => {
    setModalMode('edit');
    setSelected(report);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans text-gray-900">
      <DashboardSidebar isCollapsed={isSidebarCollapsed} toggleCollapsed={() => setIsSidebarCollapsed((value) => !value)} />

      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        <DashboardHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-5 md:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6">
            <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,250,251,0.96))] p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
                    <FileBarChart2 size={14} />
                    Report Instances
                  </p>
                  <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 md:text-5xl">Daily Report</h1>
                  <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-gray-500">
                    Create saved report instances from active report types, manage generation status, and download the latest export without rebuilding the filter logic each time.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => reportsQuery.refetch()}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                  >
                    <RefreshCcw size={16} />
                    Refresh
                  </button>
                  {canManage && (
                    <button
                      type="button"
                      onClick={openCreate}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_20px_45px_-20px_rgba(16,185,129,0.95)] transition hover:bg-emerald-600"
                    >
                      <Plus size={16} />
                      Create Report
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-[28px] border border-white/70 bg-gradient-to-br ${card.accent} to-white p-5 shadow-[0_24px_55px_-35px_rgba(15,23,42,0.35)]`}
                >
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">{card.label}</p>
                  <p className="mt-5 text-4xl font-black text-gray-950">{card.value}</p>
                </motion.div>
              ))}
            </section>

            <ReportFilters
              search={draftSearch}
              draftFilters={draftFilters}
              reportTypes={reportTypes}
              users={userOptions}
              onSearchChange={setDraftSearch}
              onDraftChange={(patch) => setDraftFilters((current) => ({ ...current, ...patch }))}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />

            <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-500">Saved Reports</p>
                  <h2 className="mt-1 text-2xl font-black text-gray-900">Report Listing</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm font-bold text-gray-500">
                  <Filter size={15} />
                  {pagination?.total || 0} records
                </div>
              </div>

              <ReportsTable
                reports={reports}
                loading={reportsQuery.isLoading}
                onGenerate={(report) => generateMutation.mutate(report.id)}
                onDownload={(report) => downloadMutation.mutate(report.id)}
                onEdit={openEdit}
                onDelete={(report) => setDeleteTarget(report)}
                generatingId={generateMutation.variables || null}
                downloadingId={downloadMutation.variables || null}
                deletingId={deleteMutation.variables || null}
                canManage={canManage}
              />

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      disabled={page >= pagination.totalPages}
                      className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <CreateReportModal
        open={isModalOpen}
        mode={modalMode}
        report={selected}
        reportTypes={reportTypes}
        currentUserLabel={currentUserLabel}
        filterOptions={filterOptions}
        loading={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsModalOpen(false);
          setSelected(null);
        }}
        onSubmit={handleSubmitModal}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_35px_120px_-45px_rgba(15,23,42,0.45)]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-500">Delete Report</p>
            <h3 className="mt-3 text-2xl font-black text-gray-900">Remove this saved report?</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-gray-500">
              <span className="font-black text-gray-800">{deleteTarget.reportName}</span> will be soft deleted. Existing audit logs stay intact.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
