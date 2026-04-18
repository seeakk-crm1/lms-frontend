import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Plus, Workflow } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import LeadStagesTable from '../components/admin/lead-stages/LeadStagesTable';
import CreateLeadStageModal from '../components/admin/lead-stages/CreateLeadStageModal';
import EditLeadStageModal from '../components/admin/lead-stages/EditLeadStageModal';
import DeleteLeadStageModal from '../components/admin/lead-stages/DeleteLeadStageModal';
import useLeadStageStore from '../store/leadStageStore';
import { useLeadStagesQuery } from '../hooks/useLeadStagesQuery';
import { useDeleteLeadStageMutation, useUpdateLeadStageMutation } from '../hooks/useLeadStageMutations';
import { LeadStage } from '../types/leadStage.types';

const LeadStagesListPage: React.FC = () => {
  const {
    search,
    filters,
    pagination,
    selectedStage,
    uiState,
    setSearch,
    setFilters,
    setPagination,
    setSelectedStage,
    setLeadStages,
    setUIState,
  } = useLeadStageStore();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; stage: LeadStage | null }>({
    isOpen: false,
    stage: null,
  });

  const [searchDraft, setSearchDraft] = useState(search);
  const { data, isLoading, isFetching } = useLeadStagesQuery();
  const updateStage = useUpdateLeadStageMutation();
  const deleteStage = useDeleteLeadStageMutation();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDraft.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, setSearch]);

  useEffect(() => {
    if (!data) return;
    setLeadStages(data.data || []);
    setPagination({
      total: data.pagination?.total || 0,
      totalPages: data.pagination?.totalPages || 1,
    });
  }, [data, setLeadStages, setPagination]);

  const records = data?.data || [];
  const total = data?.pagination?.total || 0;
  const activeCount = useMemo(() => records.filter((item) => item.status === 'ACTIVE').length, [records]);

  const stats = useMemo(
    () => [
      { label: 'Total Stages', value: total, icon: Workflow, color: 'emerald' },
      { label: 'Active Stages', value: activeCount, icon: CheckCircle, color: 'blue' },
      { label: 'Inactive Stages', value: Math.max(0, total - activeCount), icon: Activity, color: 'amber' },
    ],
    [activeCount, total],
  );

  const openCreateModal = useCallback(() => setUIState({ isCreateModalOpen: true }), [setUIState]);
  const closeCreateModal = useCallback(() => setUIState({ isCreateModalOpen: false }), [setUIState]);
  const closeEditModal = useCallback(() => setUIState({ isEditModalOpen: false }), [setUIState]);

  const handleEdit = useCallback(
    (stage: LeadStage) => {
      setSelectedStage(stage);
      setUIState({ isEditModalOpen: true });
    },
    [setSelectedStage, setUIState],
  );

  const handleDelete = useCallback(
    (stage: LeadStage) => {
      setDeleteModal({ isOpen: true, stage });
    },
    [],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteModal.stage) return;
    try {
      await deleteStage.mutateAsync(deleteModal.stage.id);
      setDeleteModal({ isOpen: false, stage: null });
    } catch {
      // Error handles by mutation
    }
  }, [deleteModal.stage, deleteStage]);

  const handleToggleStatus = useCallback(
    (stage: LeadStage) => {
      updateStage.mutate({
        id: stage.id,
        data: {
          status: stage.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
        },
      });
    },
    [updateStage],
  );

  const tableLoading = isLoading || isFetching;

  return (
    <DashboardLayout>
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
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Master {'->'} Lead Stages</h1>
              <p className="text-sm text-gray-500 max-w-lg mt-1">Configure pipeline stages that drive sales progression and reporting flow.</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -1 }}
              onClick={openCreateModal}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
              aria-label="Create lead stage"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span>Create Lead Stage</span>
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

          <LeadStagesTable
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
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>
      <CreateLeadStageModal isOpen={uiState.isCreateModalOpen} onClose={closeCreateModal} />
      <EditLeadStageModal isOpen={uiState.isEditModalOpen} onClose={closeEditModal} leadStage={selectedStage} />
      <DeleteLeadStageModal
        isOpen={deleteModal.isOpen}
        stageName={deleteModal.stage?.name || ''}
        isDeleting={deleteStage.isPending}
        onClose={() => setDeleteModal({ isOpen: false, stage: null })}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
};

export default LeadStagesListPage;
