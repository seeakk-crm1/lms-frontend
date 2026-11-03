import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, ListFilter, Plus } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StageRulesTable from '../components/admin/stage-rules/StageRulesTable';
import CreateStageRuleModal from '../components/admin/stage-rules/CreateStageRuleModal';
import EditStageRuleModal from '../components/admin/stage-rules/EditStageRuleModal';
import DeleteStageRuleModal from '../components/admin/stage-rules/DeleteStageRuleModal';
import useStageRuleStore from '../store/stageRuleStore';
import { useStageRulesQuery } from '../hooks/useStageRulesQuery';
import { useDeleteStageRuleMutation } from '../hooks/useStageRuleMutations';
import { StageRule } from '../types/stageRule.types';

const StageRulesListPage: React.FC = () => {

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
      { label: 'Total Stage Rules', value: total, icon: ListFilter, iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100/60' },
      { label: 'Active Rules', value: activeCount, icon: CheckCircle, iconBg: 'bg-blue-50 text-blue-600 border-blue-100/60' },
      { label: 'Inactive Rules', value: Math.max(0, total - activeCount), icon: Activity, iconBg: 'bg-amber-50 text-amber-600 border-amber-100/60' },
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
    <DashboardLayout>
      <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-3.5 sm:p-5 lg:p-6">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-gradient-to-bl from-emerald-50/60 via-transparent to-transparent pointer-events-none -z-10" />

        <div className="max-w-[1560px] mx-auto space-y-3.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  Master
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Stage Rules</h1>
              <p className="text-xs text-gray-500 max-w-lg mt-0.5">
                Configure dynamic form inputs shown during lead stage transitions.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -1 }}
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer active:scale-95 shrink-0"
              aria-label="Create stage rule"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Create Stage Rules</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3.5 sm:p-4 bg-white rounded-xl border border-gray-200/90 shadow-2xs flex items-center justify-between group hover:border-emerald-500/30 transition-all"
              >
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border ${stat.iconBg} group-hover:scale-105 transition-transform shrink-0`}
                >
                  <stat.icon className="w-4 h-4" />
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

      <CreateStageRuleModal isOpen={uiState.isCreateModalOpen} onClose={closeCreateModal} />
      <EditStageRuleModal isOpen={uiState.isEditModalOpen} onClose={closeEditModal} stageRule={selectedRule} />
      <DeleteStageRuleModal
        isOpen={uiState.isDeleteModalOpen}
        ruleName={selectedRule?.name || 'this rule'}
        isDeleting={deleteStageRuleMutation.isPending}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
};

export default StageRulesListPage;
