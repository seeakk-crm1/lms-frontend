import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Download, Filter, RotateCcw, TrendingDown, WalletCards } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useClosedLeadsQuery, useExportClosedLeads, useReopenLeadMutation, useUpdateRevenueMutation } from '../../hooks/useClosedLeads';
import { useLeadMetaQuery } from '../../hooks/useLeads';
import useClosedLeadsStore from '../../store/closedLeadsStore';
import useAuthStore from '../../store/useAuthStore';
import type { LeadListItem } from '../../types/lead.types';
import ClosedLeadFilters from './components/ClosedLeadFilters';
import ClosedLeadsTable from './components/ClosedLeadsTable';
import RevenueEditModal from './components/RevenueEditModal';

const LeadViewDrawer = lazy(() => import('./components/LeadViewDrawer'));

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const normalizeRole = (role: unknown) =>
  String(typeof role === 'object' && role !== null ? (role as { name?: string }).name || '' : role || '')
    .toLowerCase()
    .trim();

const ReopenLeadModal: React.FC<{
  isOpen: boolean;
  leadName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, leadName, isSubmitting, onClose, onConfirm }) => (
  <AnimatePresence>
    {isOpen ? (
      <div className="fixed inset-0 z-[130] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl"
        >
          <div className="p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <RotateCcw className="h-6 w-6" />
            </div>

            <h2 className="text-2xl font-black tracking-tight text-gray-900">Reopen Lead?</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-500">
              This will move <span className="font-black text-gray-900">{leadName}</span> back into the active pipeline and remove it from the closed list.
            </p>

            <div className="mt-8 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-[11px] font-bold leading-normal text-amber-700">
                Reopening a lead resets closure reporting on this record. Make sure the team is ready to resume work before continuing.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 text-sm font-black text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-sm font-black text-white shadow-xl shadow-amber-500/20 transition-all hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{isSubmitting ? 'Reopening…' : 'Reopen Lead'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    ) : null}
  </AnimatePresence>
);

const ClosedLeadsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [searchDraft, setSearchDraft] = useState('');
  const [revenueModalLead, setRevenueModalLead] = useState<LeadListItem | null>(null);
  const [reopenModalLead, setReopenModalLead] = useState<LeadListItem | null>(null);
  const [viewDrawer, setViewDrawer] = useState<{ lead: LeadListItem | null; tab: 'overview' | 'history' }>({
    lead: null,
    tab: 'overview',
  });

  const { user } = useAuthStore();
  const {
    leads,
    filters,
    search,
    pagination,
    setLeads,
    setFilters,
    setSearch,
    setPagination,
    setSelectedLead,
  } = useClosedLeadsStore();

  const { data, isLoading, isFetching } = useClosedLeadsQuery();
  const { data: meta } = useLeadMetaQuery();
  const exportMutation = useExportClosedLeads();
  const updateRevenueMutation = useUpdateRevenueMutation();
  const reopenLeadMutation = useReopenLeadMutation();

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchDraft.trim()), 320);
    return () => window.clearTimeout(timer);
  }, [searchDraft, setSearch]);

  useEffect(() => {
    if (!data) return;
    setLeads(data.data || []);
    setPagination(data.pagination || {});
  }, [data, setLeads, setPagination]);

  const roleKey = normalizeRole(user?.role);
  const canEditRevenue = ['admin', 'superadmin'].includes(roleKey);
  const canReopen = ['admin', 'manager', 'superadmin'].includes(roleKey);

  const totalClosed = data?.pagination?.total || 0;
  const wonRevenue = useMemo(
    () => leads.filter((lead) => lead.closureType === 'WON').reduce((sum, lead) => sum + (lead.generatedRevenue || 0), 0),
    [leads],
  );
  const lostCount = useMemo(() => leads.filter((lead) => lead.closureType === 'LOST').length, [leads]);

  const handleExport = useCallback(() => {
    exportMutation.mutate({
      search: search || undefined,
      assignedTo: filters.assignedTo || undefined,
      source: filters.source || undefined,
      closureType: filters.closureType || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      minRevenue: filters.minRevenue ? Number(filters.minRevenue) : undefined,
      maxRevenue: filters.maxRevenue ? Number(filters.maxRevenue) : undefined,
    });
  }, [exportMutation, filters, search]);

  const handleView = useCallback(
    (lead: LeadListItem, tab: 'overview' | 'history' = 'overview') => {
      setSelectedLead(lead);
      setViewDrawer({ lead, tab });
    },
    [setSelectedLead],
  );

  const closeDrawer = useCallback(() => {
    setSelectedLead(null);
    setViewDrawer({ lead: null, tab: 'overview' });
  }, [setSelectedLead]);

  const confirmReopen = useCallback(async () => {
    if (!reopenModalLead) return;
    await reopenLeadMutation.mutateAsync(reopenModalLead.id);
    setReopenModalLead(null);
  }, [reopenLeadMutation, reopenModalLead]);

  const handleSaveRevenue = useCallback(
    async (payload: { generatedRevenue: number; closureType: 'WON' | 'LOST' | 'CANCELLED' }) => {
      if (!revenueModalLead) return;
      await updateRevenueMutation.mutateAsync({ id: revenueModalLead.id, payload });
      setRevenueModalLead(null);
    },
    [revenueModalLead, updateRevenueMutation],
  );

  const stats = useMemo(
    () => [
      { label: 'Closed Leads', value: totalClosed, accent: 'from-slate-500 to-slate-700' },
      { label: 'Won Revenue', value: moneyFormatter.format(wonRevenue), accent: 'from-emerald-500 to-emerald-600' },
      { label: 'Lost Deals', value: lostCount, accent: 'from-rose-500 to-rose-600' },
    ],
    [lostCount, totalClosed, wonRevenue],
  );

  const tableLoading = isLoading || isFetching;

  return (
    <DashboardLayout>
        <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-4 md:p-8">
          <div className="absolute left-0 top-0 -z-10 h-[520px] w-[760px] bg-gradient-to-br from-slate-100 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1520px] space-y-6 md:space-y-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-slate-600">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Outcome Ledger</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Closed Leads</h1>
                <p className="mt-2 text-sm font-semibold text-gray-500">
                  Revenue outcomes, closure decisions, and reopen controls in one audit-ready view.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end"
              >
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exportMutation.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Download className="h-4 w-4" />
                  <span>{exportMutation.isPending ? 'Exporting…' : 'Export'}</span>
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
                    <div className="mt-3 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">{stat.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {showFilters ? (
              <ClosedLeadFilters
                search={searchDraft}
                filters={filters}
                meta={meta}
                onSearchChange={setSearchDraft}
                onFilterChange={setFilters}
                onReset={() => {
                  setSearchDraft('');
                  setSearch('');
                  setFilters({
                    assignedTo: undefined,
                    source: undefined,
                    closureType: undefined,
                    dateFrom: undefined,
                    dateTo: undefined,
                    minRevenue: undefined,
                    maxRevenue: undefined,
                  });
                }}
              />
            ) : null}

            <ClosedLeadsTable
              items={leads}
              isLoading={tableLoading}
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              canEditRevenue={canEditRevenue}
              canReopen={canReopen}
              onPageChange={(value) => setPagination({ page: value })}
              onView={handleView}
              onEditRevenue={setRevenueModalLead}
              onReopen={setReopenModalLead}
            />
          </div>
        </div>

      <RevenueEditModal
        isOpen={Boolean(revenueModalLead)}
        lead={revenueModalLead}
        isSubmitting={updateRevenueMutation.isPending}
        onClose={() => setRevenueModalLead(null)}
        onConfirm={handleSaveRevenue}
      />

      <ReopenLeadModal
        isOpen={Boolean(reopenModalLead)}
        leadName={reopenModalLead?.name || 'this lead'}
        isSubmitting={reopenLeadMutation.isPending}
        onClose={() => setReopenModalLead(null)}
        onConfirm={confirmReopen}
      />

      <Suspense fallback={null}>
        <LeadViewDrawer
          isOpen={Boolean(viewDrawer.lead)}
          lead={viewDrawer.lead}
          initialTab={viewDrawer.tab}
          onClose={closeDrawer}
        />
      </Suspense>
    </DashboardLayout>
  );
};

export default ClosedLeadsPage;
