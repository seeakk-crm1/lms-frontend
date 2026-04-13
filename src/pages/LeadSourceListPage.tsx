import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Plus, Settings2 } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import CreateLeadSourceModal from '../components/admin/lead-source/CreateLeadSourceModal';
import DeleteLeadSourceModal from '../components/admin/lead-source/DeleteLeadSourceModal';
import EditLeadSourceModal from '../components/admin/lead-source/EditLeadSourceModal';
import LeadSourceTable from '../components/admin/lead-source/LeadSourceTable';
import useLeadSourceStore from '../store/leadSourceStore';
import { useLeadSourcesQuery } from '../hooks/useLeadSourcesQuery';
import { useDeleteLeadSourceMutation, useToggleLeadSourceStatus } from '../hooks/useLeadSourceMutations';
import { LeadSource } from '../types/leadSource.types';

const LeadSourceListPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setMobileMenuOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<LeadSource | null>(null);

  const {
    search,
    filters,
    pagination,
    selectedLeadSource,
    uiState,
    setSearch,
    setFilters,
    setPagination,
    setSelectedLeadSource,
    setUIState,
    setLeadSources,
  } = useLeadSourceStore();

  const [searchDraft, setSearchDraft] = useState(search);
  const { data, isLoading, isFetching } = useLeadSourcesQuery();
  const toggleStatusMutation = useToggleLeadSourceStatus();
  const deleteLeadSourceMutation = useDeleteLeadSourceMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchDraft.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchDraft, setSearch]);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    if (!data) return;
    setLeadSources(data.data || []);
    setPagination({
      total: data.pagination?.total || 0,
      totalPages: data.pagination?.totalPages || 1,
    });
  }, [data, setLeadSources, setPagination]);

  const records = data?.data || [];
  const total = data?.pagination?.total || 0;
  const activeCount = useMemo(() => records.filter((item) => item.status === 'ACTIVE').length, [records]);

  const stats = useMemo(
    () => [
      { label: 'Total Lead Sources', value: total, icon: Settings2, color: 'emerald' },
      { label: 'Active Sources', value: activeCount, icon: CheckCircle, color: 'blue' },
      { label: 'Inactive Sources', value: Math.max(0, total - activeCount), icon: Activity, color: 'amber' },
    ],
    [activeCount, total],
  );

  const openCreateModal = useCallback(() => setUIState({ isCreateModalOpen: true }), [setUIState]);
  const closeCreateModal = useCallback(() => setUIState({ isCreateModalOpen: false }), [setUIState]);
  const closeEditModal = useCallback(() => setUIState({ isEditModalOpen: false }), [setUIState]);

  const handleEdit = useCallback(
    (item: LeadSource) => {
      setSelectedLeadSource(item);
      setUIState({ isEditModalOpen: true });
    },
    [setSelectedLeadSource, setUIState],
  );

  const handleToggleStatus = useCallback(
    (id: string) => {
      toggleStatusMutation.mutate(id);
    },
    [toggleStatusMutation],
  );

  const handleDeleteIntent = useCallback((item: LeadSource) => {
    setDeleteCandidate(item);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteCandidate) return;
    await deleteLeadSourceMutation.mutateAsync(deleteCandidate.id);
    setDeleteCandidate(null);
  }, [deleteCandidate, deleteLeadSourceMutation]);

  const handleStatusFilter = useCallback(
    (status?: 'ACTIVE' | 'INACTIVE') => {
      setFilters({ status });
    },
    [setFilters],
  );

  const tableLoading = isLoading || isFetching;

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden font-sans text-gray-900 selection:bg-emerald-200 selection:text-emerald-900">
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapsed={() => setIsSidebarCollapsed((value) => !value)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader setMobileMenuOpen={setMobileMenuOpen} />

        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
          <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent pointer-events-none -z-10" />

          <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    Master
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Master {'->'} Lead Source</h1>
                <p className="text-sm text-gray-500 max-w-lg mt-1">
                  Manage acquisition channels used across lead creation, analytics, and ROI reporting.
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -1 }}
                onClick={openCreateModal}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                aria-label="Create lead source"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                <span>Create Lead Source</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="p-5 md:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                >
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900">{stat.value}</h3>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      stat.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-500'
                        : stat.color === 'blue'
                          ? 'bg-blue-50 text-blue-500'
                          : 'bg-amber-50 text-amber-500'
                    }`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                </motion.div>
              ))}
            </div>

            <LeadSourceTable
              items={records}
              isLoading={tableLoading}
              search={searchDraft}
              status={filters.status}
              page={pagination.page}
              limit={pagination.limit}
              total={total}
              totalPages={data?.pagination?.totalPages || 1}
              onSearchChange={setSearchDraft}
              onStatusChange={handleStatusFilter}
              onPageChange={(value) => setPagination({ page: value })}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteIntent}
            />
          </div>
        </div>
      </main>

      <CreateLeadSourceModal isOpen={uiState.isCreateModalOpen} onClose={closeCreateModal} />

      <EditLeadSourceModal
        isOpen={uiState.isEditModalOpen}
        onClose={closeEditModal}
        leadSource={selectedLeadSource}
      />

      <DeleteLeadSourceModal
        isOpen={Boolean(deleteCandidate)}
        sourceName={deleteCandidate?.name || 'this lead source'}
        isDeleting={deleteLeadSourceMutation.isPending}
        onClose={() => {
          if (!deleteLeadSourceMutation.isPending) {
            setDeleteCandidate(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default LeadSourceListPage;
