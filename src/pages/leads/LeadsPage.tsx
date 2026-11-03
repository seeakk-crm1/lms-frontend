import React, { memo, useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Filter,
  Plus,
  TrendingUp,
  Upload,
  SlidersHorizontal,
  Users,
  Layers,
  CalendarClock,
  IndianRupee,
  Check,
  CheckSquare,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useLeadStore } from '../../store/leadStore';
import DeleteLeadModal from './components/DeleteLeadModal';
import LeadFilters from './components/LeadFilters';
import LeadSlaDecisionModal from './components/LeadSlaDecisionModal';
import LeadsTable from './components/LeadsTable';
import { ExportLeadsModal } from './components/ExportLeadsModal';
import { LeadTableColumnsModal } from './components/LeadTableColumnsModal';
import { useLeadTableColumns } from '../../hooks/useLeadTableColumns';
import { getLeadById } from '../../services/leads.api';
import { createSheetFromLeadExport } from '../../services/sheets.api';
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
import { useMutation } from '@tanstack/react-query';
import { LeadListItem } from '../../types/lead.types';
import { lazyWithChunkRecovery } from '../../utils/chunkLoadRecovery';
import useAuthStore from '../../store/useAuthStore';
import { formatCurrency } from '../../utils/currency';
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
  const [exportModalState, setExportModalState] = useState<{isOpen: boolean, format: 'csv'|'xlsx'}>({ isOpen: false, format: 'csv' });
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
  const storeDynamicFields = useLeadStore((state: any) => state.dynamicFields);
  const activeDynamicFields = useMemo(() => meta?.dynamicFields || storeDynamicFields || [], [meta?.dynamicFields, storeDynamicFields]);

  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const { allColumns, visibleColumns, selectedKeys, saveColumns, resetToDefault } = useLeadTableColumns(activeDynamicFields);

  const exportMutation = useExportLeads();
  const exportXlsxMutation = useExportLeadsXlsx();
  const importToSheetsMutation = useMutation({
    mutationFn: (fields: string[]) =>
      createSheetFromLeadExport({
        fields,
        filters: {
          search: search || undefined,
          stage: filters.stage || undefined,
          assignedTo: filters.assignedTo || undefined,
          source: filters.source || undefined,
          officeId: showOfficeFilter ? filters.officeId || undefined : undefined,
          status: filters.status || undefined,
          starred: filters.starred && filters.starred !== 'ALL' ? filters.starred : undefined,
          includeArchived: exportIncludeArchived,
        },
      }),
    onSuccess: (sheet) => {
      toast.success('Lead export imported to Sheets');
      setExportModalState((prev) => ({ ...prev, isOpen: false }));
      navigate(`/sheets?sheetId=${sheet.id}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Unable to import lead export to Sheets');
    },
  });
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
    const params = new URLSearchParams(location.search);
    const stageFromQuery = params.get('stageId') || params.get('stage');
    const locState = location.state as {
      stageId?: string;
      assignedToId?: string;
      sourceId?: string;
      officeId?: string;
    } | null;
    const stageFromState = locState?.stageId;
    const assignedToFromState = locState?.assignedToId;
    const sourceFromState = locState?.sourceId;
    const officeFromState = locState?.officeId;

    const nextFilters: any = {};
    if (stageFromQuery || stageFromState) nextFilters.stage = stageFromQuery || stageFromState;
    if (assignedToFromState) nextFilters.assignedTo = assignedToFromState;
    if (sourceFromState) nextFilters.source = sourceFromState;
    if (officeFromState) nextFilters.officeId = officeFromState;

    if (Object.keys(nextFilters).length > 0) {
      setFilters(nextFilters);
    }
  }, [location.search, location.state, setFilters]);

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

  const handleExportCsv = useCallback((fields: string[]) => {
    exportMutation.mutate({
      search: search || undefined,
      stage: filters.stage || undefined,
      assignedTo: filters.assignedTo || undefined,
      source: filters.source || undefined,
      officeId: showOfficeFilter ? filters.officeId || undefined : undefined,
      status: filters.status || undefined,
      starred: filters.starred && filters.starred !== 'ALL' ? filters.starred : undefined,
      includeArchived: exportIncludeArchived,
      fields: fields.length > 0 ? fields.join(',') : undefined,
    }, {
      onSuccess: () => setExportModalState(prev => ({ ...prev, isOpen: false }))
    });
  }, [exportMutation, exportIncludeArchived, filters.assignedTo, filters.officeId, filters.source, filters.stage, filters.status, filters.starred, search, showOfficeFilter]);

  const handleExportXlsx = useCallback((fields: string[]) => {
    exportXlsxMutation.mutate({
      search: search || undefined,
      stage: filters.stage || undefined,
      assignedTo: filters.assignedTo || undefined,
      source: filters.source || undefined,
      officeId: showOfficeFilter ? filters.officeId || undefined : undefined,
      status: filters.status || undefined,
      starred: filters.starred && filters.starred !== 'ALL' ? filters.starred : undefined,
      includeArchived: exportIncludeArchived,
      fields: fields.length > 0 ? fields.join(',') : undefined,
    }, {
      onSuccess: () => setExportModalState(prev => ({ ...prev, isOpen: false }))
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
      {
        label: 'Total Leads',
        value: totalLeads,
        icon: Users,
        iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100/70',
        lineColor: '#10b981',
        sparkPath: 'M 2,24 C 20,24 35,22 48,14 C 60,6 68,10 78,4',
      },
      {
        label: 'Open Pipeline',
        value: openLeadCount,
        icon: Layers,
        iconBg: 'bg-sky-50 text-sky-600 border-sky-100/70',
        lineColor: '#0284c7',
        sparkPath: 'M 2,22 C 18,22 28,26 42,20 C 56,14 66,8 78,6',
      },
      {
        label: 'Due Today',
        value: dueTodayCount,
        icon: CalendarClock,
        iconBg: 'bg-amber-50 text-amber-600 border-amber-100/70',
        lineColor: '#f59e0b',
        sparkPath: 'M 2,24 C 20,24 38,20 52,16 C 64,12 70,8 78,6',
      },
      {
        label: 'Expected Revenue',
        value: formatCurrency(expectedRevenue),
        icon: IndianRupee,
        iconBg: 'bg-violet-50 text-violet-600 border-violet-100/70',
        lineColor: '#8b5cf6',
        sparkPath: 'M 2,24 C 18,24 32,22 46,16 C 60,10 68,14 78,4',
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
      <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-3.5 sm:p-5 lg:p-6">
        <div className="absolute right-0 top-0 -z-10 h-[360px] w-[560px] bg-gradient-to-bl from-emerald-50/60 via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-[1560px] space-y-3.5 sm:space-y-4">
          {/* Page Header */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100/80">
                <TrendingUp className="h-3 w-3" />
                <span>Pipeline Control Room</span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">All Leads</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200/60">
                  {totalLeads} total leads
                </span>

                {selectedLeadIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700"
                  >
                    <span>{selectedLeadIds.length} Selected</span>
                    <button
                      type="button"
                      onClick={() => useLeadStore.getState().openBulkEditDrawer()}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <span className="text-indigo-200">|</span>
                    <button
                      type="button"
                      onClick={handleBulkDeleteOpen}
                      disabled={bulkDeleteMutation.isPending}
                      className="text-rose-600 hover:text-rose-700 font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      {bulkDeleteMutation.isPending ? 'Processing...' : 'Delete'}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSelectionMode}
                className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                  isSelectionMode
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{isSelectionMode ? 'Cancel Selection' : 'Select'}</span>
              </button>

              <button
                type="button"
                onClick={handleImportClick}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Import</span>
              </button>

              <div className="relative" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  disabled={exportMutation.isPending || exportXlsxMutation.isPending}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60"
                  title="Export leads to Excel or CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>
                    {exportMutation.isPending || exportXlsxMutation.isPending
                      ? 'Exporting…'
                      : 'Export'}
                  </span>
                </button>

                <AnimatePresence>
                  {isExportOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 z-50 mt-1.5 w-60 origin-top-right rounded-xl border border-gray-200 bg-white p-2 shadow-xl focus:outline-none"
                    >
                      <label className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-gray-600 border-b border-gray-100 mb-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportIncludeArchived}
                          onChange={(event) => setExportIncludeArchived(event.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Include archived leads</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportOpen(false);
                          setExportModalState({ isOpen: true, format: 'xlsx' });
                        }}
                        disabled={exportMutation.isPending || exportXlsxMutation.isPending}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        <span>Excel Workbook (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsExportOpen(false);
                          setExportModalState({ isOpen: true, format: 'csv' });
                        }}
                        disabled={exportMutation.isPending || exportXlsxMutation.isPending}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        <span>CSV (.csv)</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={() => setIsColumnsModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600" />
                <span>Columns</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={`inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                  showFilters
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </button>

              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>New Lead</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="h-[76px] sm:h-[80px] rounded-xl border border-gray-200/80 bg-white p-3 sm:p-3.5 shadow-xs flex items-center justify-between hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${stat.iconBg}`}>
                    <stat.icon size={20} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">
                      {stat.label}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none mt-1 truncate">
                      {stat.value}
                    </div>
                  </div>
                </div>

                <svg className="w-16 sm:w-20 h-8 shrink-0 overflow-visible ml-2" viewBox="0 0 80 32" fill="none">
                  <path d={stat.sparkPath} stroke={stat.lineColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            ))}
          </div>

          {/* Filter Toolbar */}
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
              visibleColumns={visibleColumns}
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

        <LeadTableColumnsModal
          isOpen={isColumnsModalOpen}
          onClose={() => setIsColumnsModalOpen(false)}
          allColumns={allColumns}
          selectedKeys={selectedKeys}
          onSave={saveColumns}
          onReset={resetToDefault}
        />

        <Suspense fallback={null}>
          <LeadFormDrawer
            isOpen={drawerState.isOpen}
            mode={drawerState.mode}
            lead={selectedLead}
            selectedLeadIds={selectedLeadIds}
            onClose={closeDrawer}
            onSuccess={() => setSelectedLeadIds([])}
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

        <ExportLeadsModal
          isOpen={exportModalState.isOpen}
          onClose={() => setExportModalState(prev => ({ ...prev, isOpen: false }))}
          isExporting={exportMutation.isPending || exportXlsxMutation.isPending}
          isImportingToSheets={importToSheetsMutation.isPending}
          exportFormatLabel={exportModalState.format === 'csv' ? 'CSV' : 'Excel'}
          onImportToSheets={(fields) => importToSheetsMutation.mutate(fields)}
          onExport={(fields) => {
            if (exportModalState.format === 'csv') handleExportCsv(fields);
            else handleExportXlsx(fields);
          }}
        />
      </DashboardLayout>
    );
};

export default LeadsPage;
