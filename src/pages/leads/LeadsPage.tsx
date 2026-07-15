import React, { memo, useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Filter, Plus, TrendingUp, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useLeadStore } from '../../store/leadStore';
import DeleteLeadModal from './components/DeleteLeadModal';
import LeadFilters from './components/LeadFilters';
import LeadSlaDecisionModal from './components/LeadSlaDecisionModal';
import LeadsTable from './components/LeadsTable';
import { getLeadById } from '../../services/leads.api';
import {
  useLeadsQuery,
  useLeadMetaQuery,
  useExportLeads,
  useExportLeadsXlsx,
  useDeleteLeadMutation,
  usePermanentDeleteLeadMutation,
  useBulkDeleteLeadsMutation,
  useChangeLeadStageMutation,
  useExtendLeadSlaMutation,
  useToggleLeadStarMutation,
} from '../../hooks/useLeads';
import { LeadListItem } from '../../types/lead.types';
import { lazyWithChunkRecovery } from '../../utils/chunkLoadRecovery';
import useAuthStore from '../../store/useAuthStore';
import { canUseOfficeFilter } from '../../utils/officeFilterAccess';

const LeadFormDrawer = lazyWithChunkRecovery(() => import('./components/LeadFormDrawer'));
const LeadViewDrawer = lazyWithChunkRecovery(() => import('./components/LeadViewDrawer'));
const LeadHistoryDrawer = lazyWithChunkRecovery(() => import('./components/LeadHistoryDrawer'));

const LeadsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(true);
  const [searchDraft, setSearchDraft] = useState('');
  const [exportIncludeArchived, setExportIncludeArchived] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
  const [viewLead, setViewLead] = useState<LeadListItem | null>(null);
  const [historyLeadId, setHistoryLeadId] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const showOfficeFilter = canUseOfficeFilter(currentUser);

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

  const { data, isLoading, isFetching, isError } = useLeadsQuery();
  const { data: meta } = useLeadMetaQuery();
  const exportMutation = useExportLeads();
  const exportXlsxMutation = useExportLeadsXlsx();
  const deleteMutation = useDeleteLeadMutation();
  const permanentDeleteMutation = usePermanentDeleteLeadMutation();
  const bulkDeleteMutation = useBulkDeleteLeadsMutation();
  const changeStageMutation = useChangeLeadStageMutation();
  const extendLeadSlaMutation = useExtendLeadSlaMutation();
  const toggleLeadStarMutation = useToggleLeadStarMutation();

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

  useEffect(() => {
    const state = location.state as { fromQuickAdd?: boolean } | null;
    if (!state?.fromQuickAdd) return;

    // Quick Add should always land on an unfiltered list so newly created leads are visible,
    // even when they do not have a stage yet.
    setSearch('');
    setSearchDraft('');
    setFilters({
      stage: undefined,
      assignedTo: undefined,
      source: undefined,
      status: undefined,
      starred: 'ALL',
      createdFrom: undefined,
      createdTo: undefined,
    });
  }, [location.state, setFilters, setSearch, setSearchDraft]);

  useEffect(() => {
    const openLeadId = (location.state as { openLeadId?: string } | null)?.openLeadId;
    if (!openLeadId) return;

    let cancelled = false;

    const openRequestedLead = async () => {
      const target = leads.find((lead) => lead.id === openLeadId);
      if (target) {
        openEditDrawer(target);
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }

      try {
        const response = await getLeadById(openLeadId);
        if (cancelled) return;
        if (response?.data) {
          openEditDrawer(response.data);
        }
      } catch (error: any) {
        if (cancelled) return;
        const fromQuickAdd = (location.state as { fromQuickAdd?: boolean } | null)?.fromQuickAdd;
        if (!fromQuickAdd) {
          toast.error(error?.response?.data?.message || 'Requested lead is not available with your current access.');
        }
      } finally {
        if (!cancelled) {
          navigate(location.pathname, { replace: true, state: {} });
        }
      }
    };

    void openRequestedLead();

    return () => {
      cancelled = true;
    };
  }, [leads, location.pathname, location.state, navigate, openEditDrawer]);

  const totalLeads = data?.pagination?.total || 0;
  const expectedRevenue = data?.expectedRevenue || 0;
  const dueTodayCount = useMemo(
    () =>
      leads.filter((lead) => {
        if (!lead.nextFollowUpAt) return false;
        return new Date(lead.nextFollowUpAt).toDateString() === new Date().toDateString();
      }).length,
    [leads],
  );

  const openLeadCount = useMemo(() => leads.filter((lead) => !lead.isClosed && !lead.isLOB).length, [leads]);

  const handleExportCsv = useCallback(() => {
    exportMutation.mutate({
      search: search || undefined,
      stage: filters.stage || undefined,
      assignedTo: filters.assignedTo || undefined,
      source: filters.source || undefined,
      officeId: showOfficeFilter ? filters.officeId || undefined : undefined,
      status: filters.status || undefined,
      starred: filters.starred && filters.starred !== 'ALL' ? filters.starred : undefined,
      includeArchived: exportIncludeArchived,
    });
  }, [exportMutation, exportIncludeArchived, filters.assignedTo, filters.officeId, filters.source, filters.stage, filters.status, filters.starred, search, showOfficeFilter]);

  const handleExportXlsx = useCallback(() => {
    exportXlsxMutation.mutate({
      search: search || undefined,
      stage: filters.stage || undefined,
      assignedTo: filters.assignedTo || undefined,
      source: filters.source || undefined,
      officeId: showOfficeFilter ? filters.officeId || undefined : undefined,
      status: filters.status || undefined,
      starred: filters.starred && filters.starred !== 'ALL' ? filters.starred : undefined,
      includeArchived: exportIncludeArchived,
    });
  }, [exportXlsxMutation, exportIncludeArchived, filters.assignedTo, filters.officeId, filters.source, filters.stage, filters.status, filters.starred, search, showOfficeFilter]);

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

  const handleViewLead = useCallback((lead: LeadListItem) => {
    setViewLead(lead);
  }, []);

  const handleToggleLeadStar = useCallback(
    (lead: LeadListItem) => {
      const previousStarred = Boolean(lead.isStarred);
      const nextStarred = !previousStarred;
      setViewLead((current) => (current?.id === lead.id ? { ...current, isStarred: nextStarred } : current));
      toggleLeadStarMutation.mutate(
        { id: lead.id, starred: nextStarred },
        {
          onError: () => {
            setViewLead((current) => (current?.id === lead.id ? { ...current, isStarred: previousStarred } : current));
          },
        },
      );
    },
    [toggleLeadStarMutation],
  );

  const handleCloseViewLead = useCallback(() => {
    setViewLead(null);
  }, []);

  const handleEditFromView = useCallback(
    (lead: LeadListItem) => {
      setViewLead(null);
      openEditDrawer(lead);
    },
    [openEditDrawer],
  );

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
      {
        label: 'Expected Revenue',
        value: expectedRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }),
        accent: 'from-violet-500 to-fuchsia-600',
      },
    ],
    [dueTodayCount, expectedRevenue, openLeadCount, totalLeads],
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

                <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-600">
                    <input
                      type="checkbox"
                      checked={exportIncludeArchived}
                      onChange={(event) => setExportIncludeArchived(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Include archived leads in export</span>
                  </label>
                  <div className="relative sm:ml-auto" ref={exportMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsExportOpen(!isExportOpen)}
                      disabled={exportMutation.isPending || exportXlsxMutation.isPending}
                      title="Exports every lead that matches your current filters (all pages), not only the visible table."
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Download className="h-4 w-4" />
                      <span>
                        {exportMutation.isPending || exportXlsxMutation.isPending
                          ? 'Exporting…'
                          : 'Export'}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isExportOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-gray-100 bg-white p-1.5 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] focus:outline-none"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setIsExportOpen(false);
                              handleExportXlsx();
                            }}
                            disabled={exportMutation.isPending || exportXlsxMutation.isPending}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
                          >
                            <span>Excel Workbook (.xlsx)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsExportOpen(false);
                              handleExportCsv();
                            }}
                            disabled={exportMutation.isPending || exportXlsxMutation.isPending}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
                          >
                            <span>CSV (.csv)</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

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

            <div className="grid gap-4 md:grid-cols-4">
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
                filters={showOfficeFilter ? filters : { ...filters, officeId: undefined }}
                meta={meta}
                onSearchChange={setSearchDraft}
                onFilterChange={(patch) => setFilters(showOfficeFilter ? patch : { ...patch, officeId: undefined })}
                showOfficeFilter={showOfficeFilter}
                onReset={() => {
                  setSearchDraft('');
                  setSearch('');
                  setFilters({
                    stage: undefined,
                    assignedTo: undefined,
                    source: undefined,
                    officeId: undefined,
                    status: undefined,
                    starred: 'ALL',
                    createdFrom: undefined,
                    createdTo: undefined,
                  });
                }}
              />
            ) : null}

            <LeadsTable
              items={leads}
              isLoading={tableLoading}
              isError={isError}
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              isSelectionMode={isSelectionMode}
              selectedIds={selectedLeadIds}
              onToggleSelection={handleToggleSelection}
              onSelectAll={handleSelectAll}
              onPageChange={(value: number) => setPagination({ page: value })}
              onLimitChange={(value: number) => setPagination({ limit: value, page: 1 })}
              onView={handleViewLead}
              onToggleStar={handleToggleLeadStar}
              onEdit={openEditDrawer}
              onHistory={(lead) => setHistoryLeadId(lead.id)}
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
          <LeadViewDrawer
            isOpen={Boolean(viewLead)}
            lead={viewLead}
            onClose={handleCloseViewLead}
            onEdit={handleEditFromView}
            onToggleStar={handleToggleLeadStar}
          />
          <LeadHistoryDrawer
            isOpen={!!historyLeadId}
            leadId={historyLeadId}
            onClose={() => setHistoryLeadId(null)}
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
