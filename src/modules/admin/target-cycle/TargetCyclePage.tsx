import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, Loader2, Plus } from 'lucide-react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import TargetCycleModal from './TargetCycleModal';
import TargetCycleTable from './TargetCycleTable';
import { useTargetCycleStore } from './targetCycle.store';
import {
  useCreateTargetCycleMutation,
  useDeleteTargetCycleMutation,
  useUpdateTargetCycleMutation,
} from './useTargetCycleMutation';
import { useTargetCyclesQuery } from './useTargetCycleQuery';
import type { TargetCycle, TargetCycleFormValues, TargetCycleStatus } from './types';

const TargetCyclePage: React.FC = () => {
  const [searchDraft, setSearchDraft] = useState('');

  const {
    targetCycles,
    filters,
    search,
    pagination,
    formState,
    deleteCandidate,
    setTargetCycles,
    setSearch,
    setFilters,
    setPagination,
    setFormState,
    setDeleteCandidate,
    resetForm,
  } = useTargetCycleStore();

  const { data, isLoading, isFetching } = useTargetCyclesQuery();
  const createMutation = useCreateTargetCycleMutation();
  const updateMutation = useUpdateTargetCycleMutation();
  const deleteMutation = useDeleteTargetCycleMutation();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDraft.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, setSearch]);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    if (!data) return;
    setTargetCycles(data.data || []);
    setPagination({
      total: data.pagination?.total || 0,
      totalPages: data.pagination?.totalPages || 1,
    });
  }, [data, setPagination, setTargetCycles]);

  const total = data?.pagination?.total || 0;
  const activeCount = useMemo(() => targetCycles.filter((item) => item.status === 'ACTIVE').length, [targetCycles]);
  const stats = useMemo(
    () => [
      { label: 'Total Cycles', value: total, icon: CalendarClock, color: 'emerald' },
      { label: 'Active Cycles', value: activeCount, icon: CheckCircle2, color: 'blue' },
      { label: 'Inactive Cycles', value: Math.max(0, total - activeCount), icon: CalendarClock, color: 'amber' },
    ],
    [activeCount, total],
  );

  const existingNames = useMemo(() => targetCycles.map((item) => item.name), [targetCycles]);

  const openCreateModal = useCallback(() => {
    setFormState({ mode: 'create', selectedCycle: null, isModalOpen: true });
  }, [setFormState]);

  const openEditModal = useCallback(
    (cycle: TargetCycle) => {
      setFormState({ mode: 'edit', selectedCycle: cycle, isModalOpen: true });
    },
    [setFormState],
  );

  const closeModal = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(
    async (payload: TargetCycleFormValues) => {
      if (formState.mode === 'edit' && formState.selectedCycle) {
        await updateMutation.mutateAsync({
          id: formState.selectedCycle.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      resetForm();
    },
    [createMutation, formState.mode, formState.selectedCycle, resetForm, updateMutation],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteCandidate) return;
    await deleteMutation.mutateAsync(deleteCandidate.id);
    setDeleteCandidate(null);
  }, [deleteCandidate, deleteMutation, setDeleteCandidate]);

  return (
    <DashboardLayout>
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
          <div className="absolute top-0 right-0 w-[820px] h-[520px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent pointer-events-none -z-10" />

          <div className="max-w-[1420px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    Master
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Target Cycle</h1>
                <p className="text-sm text-gray-500 mt-1">Configure monthly working cycles</p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -1, scale: 1.01, boxShadow: '0 10px 24px -14px rgba(16,185,129,0.7)' }}
                whileTap={{ scale: 0.99 }}
                onClick={openCreateModal}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 sm:px-7 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Target Cycle
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="p-5 md:p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between"
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

            <TargetCycleTable
              items={targetCycles}
              isLoading={isLoading || isFetching}
              search={searchDraft}
              status={filters.status}
              page={pagination.page}
              limit={pagination.limit}
              total={total}
              totalPages={data?.pagination?.totalPages || 1}
              onSearchChange={setSearchDraft}
              onStatusChange={(value?: TargetCycleStatus) => setFilters({ status: value })}
              onPageChange={(value) => setPagination({ page: value })}
              onEdit={openEditModal}
              onDelete={(cycle) => setDeleteCandidate(cycle)}
            />
          </div>
        </div>

      <TargetCycleModal
        isOpen={formState.isModalOpen}
        mode={formState.mode}
        selectedCycle={formState.selectedCycle}
        existingNames={existingNames}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <AnimatePresence>
        {deleteCandidate ? (
          <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteCandidate(null)}
              className="absolute inset-0 bg-gray-900/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl sm:rounded-2xl bg-white border border-gray-100 shadow-xl p-4 sm:p-5"
            >
              <h3 className="text-base font-black text-gray-900">Delete target cycle?</h3>
              <p className="text-sm text-gray-500 mt-1">
                This will soft-delete <span className="font-bold text-gray-700">{deleteCandidate.name}</span>.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-black text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 inline-flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TargetCyclePage;
