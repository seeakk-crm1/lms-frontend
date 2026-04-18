import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, Plus, TrendingUp, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import useLeadStore from '../../store/leadStore';
import {
  useLeadsQuery,
  useLeadMetaQuery,
  useExportLeads,
  useDeleteLeadMutation,
  usePermanentDeleteLeadMutation,
  useBulkDeleteLeadsMutation,
  useChangeLeadStageMutation,
  useExtendLeadSlaMutation,
} from '../../hooks/useLeads';
import { LeadListItem } from '../../types/lead.types';

const LeadFormDrawer = lazy(() => import('./components/LeadFormDrawer'));

const LeadsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(true);
  const [searchDraft, setSearchDraft] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ 
    isOpen: boolean; 
    lead: LeadListItem | null;
    isBulk?: boolean;
  }>({
    isOpen: false,
    lead: null,
    isBulk: false,
  });
  const [dismissedSlaLeadIds, setDismissedSlaLeadIds] = useState<string[]>([]);
  const [slaModalLead, setSlaModalLead] = useState<LeadListItem | null>(null);

  const {
    leads,
    filters,
    search,
    pagination,
    selectedLead,
    drawerState,
    setLeads,
    setFilters,
    setSearch,
    setPagination,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
  } = useLeadStore();

  const { data, isLoading, isFetching } = useLeadsQuery();
  const { data: meta } = useLeadMetaQuery();
  const exportMutation = useExportLeads();
  const deleteMutation = useDeleteLeadMutation();
  const permanentDeleteMutation = usePermanentDeleteLeadMutation();
  const bulkDeleteMutation = useBulkDeleteLeadsMutation();
  const changeStageMutation = useChangeLeadStageMutation();
  const extendLeadSlaMutation = useExtendLeadSlaMutation();

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchDraft.trim()), 320);
    return () => window.clearTimeout(timer);
  }, [searchDraft, setSearch]);

  useEffect(() => {
    if (!data) return;
    setLeads(data.leads || []);
    setPagination(data.pagination || {});
  }, [data, setLeads, setPagination]);

  useEffect(() => {
    const candidate = leads.find(
      (lead) =>
        lead.slaAction === 'WARN_AND_CHOOSE' &&
        lead.slaState === 'WARNING' &&
        !dismissedSlaLeadIds.includes(lead.id),
    );

    setSlaModalLead(candidate || null);
  }, [dismissedSlaLeadIds, leads]);

  useEffect(() => {
    if (!location.state || !(location.state as { openCreateLead?: boolean }).openCreateLead) {
      return;
    }

    openCreateDrawer();
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, openCreateDrawer]);

  const totalLeads = data?.pagination?.total || 0;
  const dueTodayCount = useMemo(
    () =>
      leads.filter((lead) => {
        if (!lead.nextFollowUpAt) return false;
        return new Date(lead.nextFollowUpAt).toDateString() === new Date().toDateString();
      }).length,
    [leads],
  );

  const openLeadCount = useMemo(() => leads.filter((lead) => !lead.isClosed && !lead.isLOB).length, [leads]);

  const handleExport = useCallback(() => {
    exportMutation.mutate({
      search: search || undefined,
      stage: filters.stage || undefined,
      assignedTo: filters.assignedTo || undefined,
      source: filters.source || undefined,
      status: filters.status || undefined,
    });
  }, [exportMutation, filters.assignedTo, filters.source, filters.stage, filters.status, search]);

  const handleImportClick = useCallback(() => {
    navigate('/leads/import');
  }, [navigate]);

  const handleImportFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    // Unused now since Import redirects to its own page, but keeping to avoid TS errors if leftover
  }, []);

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Selection should persist across pages, only reset manually or after a successful action
  useEffect(() => {
    if (leads.length === 0 && !isLoading) {
      setSelectedLeadIds([]);
      setIsSelectionMode(false);
    }
  }, [leads.length, isLoading]);

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      if (prev) {
        setSelectedLeadIds([]);
      }
      return !prev;
    });
  }, []);

  const handleToggleSelection = useCallback((id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const pageIds = (leads || []).map((l) => l.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedLeadIds.includes(id));
    if (allSelected) {
      setSelectedLeadIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedLeadIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  }, [leads, selectedLeadIds]);

  const handleBulkDeleteOpen = useCallback(() => {
    if (selectedLeadIds.length === 0) return;
    setDeleteModal({
      isOpen: true,
      lead: null,
      isBulk: true,
    });
  }, [selectedLeadIds.length]);

  const handleDelete = useCallback(
    (lead: LeadListItem) => {
      setDeleteModal({ isOpen: true, lead, isBulk: false });
    },
    [],
  );

  const closeDeleteModal = useCallback(() => {
    if (deleteMutation.isPending || permanentDeleteMutation.isPending || bulkDeleteMutation.isPending) return;
    setDeleteModal({ isOpen: false, lead: null, isBulk: false });
  }, [deleteMutation.isPending, permanentDeleteMutation.isPending, bulkDeleteMutation.isPending]);

  const confirmArchive = useCallback(async () => {
    if (deleteModal.isBulk) {
      if (selectedLeadIds.length === 0) return;
      await bulkDeleteMutation.mutateAsync({ ids: selectedLeadIds, permanent: false });
      setSelectedLeadIds([]);
      setIsSelectionMode(false);
      setDeleteModal({ isOpen: false, lead: null, isBulk: false });
    } else if (deleteModal.lead) {
      await deleteMutation.mutateAsync(deleteModal.lead.id);
      setDeleteModal({ isOpen: false, lead: null, isBulk: false });
    }
  }, [deleteModal, selectedLeadIds, bulkDeleteMutation, deleteMutation]);

  const confirmPermanentDelete = useCallback(async () => {
    if (deleteModal.isBulk) {
      if (selectedLeadIds.length === 0) return;
      await bulkDeleteMutation.mutateAsync({ ids: selectedLeadIds, permanent: true });
      setSelectedLeadIds([]);
      setIsSelectionMode(false);
      setDeleteModal({ isOpen: false, lead: null, isBulk: false });
    } else if (deleteModal.lead) {
      await permanentDeleteMutation.mutateAsync(deleteModal.lead.id);
      setDeleteModal({ isOpen: false, lead: null, isBulk: false });
    }
  }, [deleteModal, selectedLeadIds, bulkDeleteMutation, permanentDeleteMutation]);

  const stats = useMemo(
    () => [
      { label: 'Total Leads', value: totalLeads, accent: 'from-emerald-500 to-emerald-600' },
      { label: 'Open Pipeline', value: openLeadCount, accent: 'from-blue-500 to-blue-600' },
      { label: 'Due Today', value: dueTodayCount, accent: 'from-amber-500 to-orange-500' },
    ],
    [dueTodayCount, openLeadCount, totalLeads],
  );

  const tableLoading = isLoading || isFetching;
  const lobStageId = useMemo(
    () => meta?.stages?.find((stage) => stage.isLOB)?.id || '',
    [meta?.stages],
  );
  const lobReasonOptions = useMemo(
    () => (meta?.lobReasons || []).map((reason) => ({ value: reason.id, label: reason.label })),
    [meta?.lobReasons],
  );

  const closeSlaModal = useCallback(() => {
    if (slaModalLead?.id) {
      setDismissedSlaLeadIds((current) => (current.includes(slaModalLead.id) ? current : [...current, slaModalLead.id]));
    }
    setSlaModalLead(null);
  }, [slaModalLead?.id]);

  const handleExtendLeadSla = useCallback(
    async (extraDays: number) => {
      if (!slaModalLead) return;
      await extendLeadSlaMutation.mutateAsync({
        id: slaModalLead.id,
        payload: { extraDays },
      });
      setDismissedSlaLeadIds((current) => (current.includes(slaModalLead.id) ? current : [...current, slaModalLead.id]));
      setSlaModalLead(null);
    },
    [extendLeadSlaMutation, slaModalLead],
  );

  const handleMoveLeadToLob = useCallback(
    async (payload: { reasonId: string; remarks: string }) => {
      if (!slaModalLead) return;
      if (!lobStageId) {
        toast.error('LOB stage is not configured for this workspace yet.');
        return;
      }
      await changeStageMutation.mutateAsync({
        id: slaModalLead.id,
        payload: {
          stageId: lobStageId,
          reasonId: payload.reasonId,
          remarks: payload.remarks,
        },
      });
      setDismissedSlaLeadIds((current) => (current.includes(slaModalLead.id) ? current : [...current, slaModalLead.id]));
      setSlaModalLead(null);
    },
    [changeStageMutation, lobStageId, slaModalLead],
  );

  return (
    <DashboardLayout>
      <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-4 md:p-8">
          <div className="absolute right-0 top-0 -z-10 h-[480px] w-[760px] bg-gradient-to-bl from-emerald-50 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1480px] space-y-6 md:space-y-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Pipeline Control Room</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">All Leads</h1>
                <p className="mt-2 text-sm font-semibold text-gray-500 flex items-center gap-4">
                  <span>Total Count: <span className="font-black text-gray-900">{totalLeads}</span></span>
                  {selectedLeadIds.length > 0 && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100"
                    >
                      <span className="text-xs font-black text-indigo-700">{selectedLeadIds.length} Selected</span>
                      <button 
                        onClick={handleBulkDeleteOpen}
                        disabled={bulkDeleteMutation.isPending}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors disabled:opacity-50"
                      >
                        {bulkDeleteMutation.isPending ? 'Processing...' : 'Delete Selected'}
                      </button>
                    </motion.span>
                  )}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end"
              >


                <button
                  type="button"
                  onClick={handleToggleSelectionMode}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
                    ${isSelectionMode 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200' 
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-emerald-200 hover:text-emerald-600'
                    }`}
                >
                  <span>{isSelectionMode ? 'Cancel Selection' : 'Select'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportClick}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Download className="h-4 w-4" />
                  <span>{exportMutation.isPending ? 'Exporting…' : 'Export to Excel'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition-all ${
                    showFilters
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10'
                      : 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>

                <button
                  type="button"
                  onClick={openCreateDrawer}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-600"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Lead</span>
                </button>
              </motion.div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${stat.accent}`} />
                  <div className="p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">{stat.label}</div>
                    <div className="mt-3 text-4xl font-black tracking-tight text-gray-900">{stat.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {showFilters ? (
              <LeadFilters
                search={searchDraft}
                filters={filters}
                meta={meta}
                onSearchChange={setSearchDraft}
                onFilterChange={setFilters}
                onReset={() => {
                  setSearchDraft('');
                  setSearch('');
                  setFilters({
                    stage: undefined,
                    assignedTo: undefined,
                    source: undefined,
                    status: undefined,
                    createdFrom: undefined,
                    createdTo: undefined,
                  });
                }}
              />
            ) : null}

            <LeadsTable
              items={leads}
              isLoading={tableLoading}
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              isSelectionMode={isSelectionMode}
              selectedIds={selectedLeadIds}
              onToggleSelection={handleToggleSelection}
              onSelectAll={handleSelectAll}
              onPageChange={(value) => setPagination({ page: value })}
              onLimitChange={(value) => setPagination({ limit: value, page: 1 })}
              onEdit={openEditDrawer}
              onDelete={handleDelete}
            />
          </div>
        </div>

        <Suspense fallback={null}>
          <LeadFormDrawer
            isOpen={drawerState.isOpen}
            mode={drawerState.mode}
            lead={selectedLead}
            onClose={closeDrawer}
          />
        </Suspense>

        <DeleteLeadModal
          isOpen={deleteModal.isOpen}
          leadName={deleteModal.isBulk ? `${selectedLeadIds.length} selected leads` : deleteModal.lead?.name || 'this lead'}
          isArchiving={!!(deleteMutation.isPending || (deleteModal.isBulk && bulkDeleteMutation.isPending))}
          isPermanentlyDeleting={!!(permanentDeleteMutation.isPending || (deleteModal.isBulk && bulkDeleteMutation.isPending))}
          onClose={closeDeleteModal}
          onArchive={confirmArchive}
          onPermanentDelete={confirmPermanentDelete}
        />

        <LeadSlaDecisionModal
          isOpen={Boolean(slaModalLead)}
          lead={slaModalLead}
          isSubmitting={changeStageMutation.isPending || extendLeadSlaMutation.isPending}
          lobReasonOptions={lobReasonOptions}
          onClose={closeSlaModal}
          onExtend={handleExtendLeadSla}
          onMoveToLob={handleMoveLeadToLob}
        />
      </DashboardLayout>
    );
};

export default LeadsPage;
