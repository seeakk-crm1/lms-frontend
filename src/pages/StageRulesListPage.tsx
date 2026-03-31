import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, ListFilter, Plus } from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StageRulesTable from '../components/admin/stage-rules/StageRulesTable';
import CreateStageRuleModal from '../components/admin/stage-rules/CreateStageRuleModal';
import EditStageRuleModal from '../components/admin/stage-rules/EditStageRuleModal';
import DeleteStageRuleModal from '../components/admin/stage-rules/DeleteStageRuleModal';
import useStageRuleStore from '../store/stageRuleStore';
import { useStageRulesQuery } from '../hooks/useStageRulesQuery';
import { useDeleteStageRuleMutation } from '../hooks/useStageRuleMutations';
import { StageRule } from '../types/stageRule.types';

const StageRulesListPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setMobileMenuOpen] = useState(false);

  const {
    search,
    filters,
    pagination,
    selectedRule,
    uiState,
    setSearch,
    setFilters,
    setPagination,
    setSelectedRule,
    setRules,
    setUIState,
  } = useStageRuleStore();

  const [searchDraft, setSearchDraft] = useState(search);
  const { data, isLoading, isFetching } = useStageRulesQuery();
  const deleteStageRuleMutation = useDeleteStageRuleMutation();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDraft.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, setSearch]);

  useEffect(() => {
    if (!data) return;
    setRules(data.data || []);
    setPagination({
      total: data.pagination?.total || 0,
      totalPages: data.pagination?.totalPages || 1,
    });
  }, [data, setPagination, setRules]);

  const records = data?.data || [];
  const total = data?.pagination?.total || 0;
  const activeCount = useMemo(() => records.filter((item) => item.status === 'ACTIVE').length, [records]);

  const stats = useMemo(
    () => [
      { label: 'Total Stage Rules', value: total, icon: ListFilter, color: 'emerald' },
      { label: 'Active Rules', value: activeCount, icon: CheckCircle, color: 'blue' },
      { label: 'Inactive Rules', value: Math.max(0, total - activeCount), icon: Activity, color: 'amber' },
    ],
    [activeCount, total],
  );

  const openCreateModal = useCallback(() => setUIState({ isCreateModalOpen: true }), [setUIState]);
  const closeCreateModal = useCallback(() => setUIState({ isCreateModalOpen: false }), [setUIState]);
  const closeEditModal = useCallback(() => setUIState({ isEditModalOpen: false }), [setUIState]);
  const closeDeleteModal = useCallback(() => setUIState({ isDeleteModalOpen: false }), [setUIState]);

  const handleEdit = useCallback(
    (rule: StageRule) => {
      setSelectedRule(rule);
      setUIState({ isEditModalOpen: true });
    },
    [setSelectedRule, setUIState],
  );

  const handleDeleteIntent = useCallback(
    (rule: StageRule) => {
      setSelectedRule(rule);
      setUIState({ isDeleteModalOpen: true });
    },
    [setSelectedRule, setUIState],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedRule) return;
    try {
      await deleteStageRuleMutation.mutateAsync(selectedRule.id);
      closeDeleteModal();
      setSelectedRule(null);
    } catch {
      // Mutation hook handles toast
    }
  }, [closeDeleteModal, deleteStageRuleMutation, selectedRule, setSelectedRule]);

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
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Master {'->'} Stage Rules</h1>
                <p className="text-sm text-gray-500 max-w-lg mt-1">
                  Configure dynamic form inputs shown during lead stage transitions.
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -1 }}
                onClick={openCreateModal}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                aria-label="Create stage rule"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                <span>Create Stage Rules</span>
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

            <StageRulesTable
              items={records}
              isLoading={tableLoading}
              search={searchDraft}
              status={filters.status}
              page={pagination.page}
              limit={pagination.limit}
              total={total}
              totalPages={data?.pagination?.totalPages || 1}
              onSearchChange={setSearchDraft}
              onStatusChange={(value) => setFilters({ status: value })}
              onPageChange={(value) => setPagination({ page: value })}
              onEdit={handleEdit}
              onDelete={handleDeleteIntent}
            />
          </div>
        </div>
      </main>

      <CreateStageRuleModal isOpen={uiState.isCreateModalOpen} onClose={closeCreateModal} />
      <EditStageRuleModal isOpen={uiState.isEditModalOpen} onClose={closeEditModal} stageRule={selectedRule} />
      <DeleteStageRuleModal
        isOpen={uiState.isDeleteModalOpen}
        ruleName={selectedRule?.name || 'this rule'}
        isDeleting={deleteStageRuleMutation.isPending}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default StageRulesListPage;
