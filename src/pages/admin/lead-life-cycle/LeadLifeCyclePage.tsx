import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GitPullRequestCreate, Loader2, Plus, ShieldCheck } from 'lucide-react';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import LeadLifeCycleTable from '../../../components/admin/lead-life-cycle/LeadLifeCycleTable';
import LeadLifeCycleFormModal from '../../../components/admin/lead-life-cycle/LeadLifeCycleFormModal';
import {
  useCreateLifeCycleMutation,
  useDeleteLifeCycleMutation,
  useUpdateLifeCycleMutation,
} from '../../../hooks/admin/lead-life-cycle/useLifeCycleMutations';
import {
  useLeadStageOptionsQuery,
  useLifeCyclesQuery,
} from '../../../hooks/admin/lead-life-cycle/useLifeCyclesQuery';
import { useLeadLifeCycleStore } from '../../../store/admin/lead-life-cycle/leadLifeCycleStore';
import type {
  LeadLifeCycle,
  LeadLifeCycleFormValues,
} from '../../../types/admin/lead-life-cycle/leadLifeCycle.types';

const LeadLifeCyclePage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setMobileMenuOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');

  const {
    lifeCycles,
    selectedLifeCycle,
    pagination,
    search,
    formState,
    deleteCandidate,
    setLifeCycles,
    setSelected,
    setSearch,
    setPagination,
    setFormState,
    setDeleteCandidate,
    resetForm,
  } = useLeadLifeCycleStore();

  const lifeCyclesQuery = useLifeCyclesQuery();
  const stageOptionsQuery = useLeadStageOptionsQuery();
  const createMutation = useCreateLifeCycleMutation();
  const updateMutation = useUpdateLifeCycleMutation();
  const deleteMutation = useDeleteLifeCycleMutation();

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchDraft.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, setSearch]);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    if (!lifeCyclesQuery.data) return;
    setLifeCycles(lifeCyclesQuery.data.data.lifeCycles || []);
    setPagination({
      total: lifeCyclesQuery.data.pagination?.total || 0,
      totalPages: lifeCyclesQuery.data.pagination?.totalPages || 1,
    });
  }, [lifeCyclesQuery.data, setLifeCycles, setPagination]);

  const openCreate = useCallback(() => {
    setSelected(null);
    setFormState({ mode: 'create', isModalOpen: true });
  }, [setFormState, setSelected]);

  const openEdit = useCallback(
    (lifeCycle: LeadLifeCycle) => {
      setSelected(lifeCycle);
      setFormState({ mode: 'edit', isModalOpen: true });
    },
    [setFormState, setSelected],
  );

  const closeModal = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(
    async (payload: LeadLifeCycleFormValues) => {
      if (formState.mode === 'edit' && selectedLifeCycle) {
        await updateMutation.mutateAsync({ id: selectedLifeCycle.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      resetForm();
    },
    [createMutation, formState.mode, resetForm, selectedLifeCycle, updateMutation],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteCandidate) return;
    await deleteMutation.mutateAsync(deleteCandidate.id);
    setDeleteCandidate(null);
  }, [deleteCandidate, deleteMutation, setDeleteCandidate]);

  const total = lifeCyclesQuery.data?.pagination?.total || 0;
  const defaultCount = useMemo(() => lifeCycles.filter((item) => item.isDefault).length, [lifeCycles]);

  const stats = useMemo(
    () => [
      { label: 'Total Life Cycles', value: total, icon: GitPullRequestCreate, color: 'emerald' },
      { label: 'Default Configured', value: defaultCount, icon: ShieldCheck, color: 'blue' },
      { label: 'Custom Workflows', value: Math.max(0, total - defaultCount), icon: GitPullRequestCreate, color: 'amber' },
    ],
    [defaultCount, total],
  );

  const existingNames = useMemo(() => lifeCycles.map((item) => item.name), [lifeCycles]);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 font-sans text-gray-900 selection:bg-emerald-200 selection:text-emerald-900">
      <DashboardSidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapsed={() => setIsSidebarCollapsed((value) => !value)}
      />

      <main className="relative flex h-full flex-1 flex-col overflow-hidden">
        <DashboardHeader setMobileMenuOpen={setMobileMenuOpen} />

        <div className="custom-scrollbar relative flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="pointer-events-none absolute right-0 top-0 -z-10 h-[520px] w-[820px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1420px] space-y-6 md:space-y-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Master Configuration
                  </span>
                </div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">Lead Life Cycle</h1>
                <p className="mt-1 text-sm text-gray-500">Configure lead movement paths and expected SLA timeline.</p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -1, scale: 1.01, boxShadow: '0 10px 24px -14px rgba(34,197,94,0.7)' }}
                whileTap={{ scale: 0.99 }}
                onClick={openCreate}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-600 md:w-auto sm:px-7"
              >
                <Plus className="h-4 w-4" />
                + Create Life Cycle
              </motion.button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
                >
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                    <h3 className="text-2xl font-black text-gray-900 md:text-3xl">{stat.value}</h3>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      stat.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-500'
                        : stat.color === 'blue'
                          ? 'bg-blue-50 text-blue-500'
                          : 'bg-amber-50 text-amber-500'
                    }`}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                </motion.div>
              ))}
            </div>

            <LeadLifeCycleTable
              items={lifeCycles}
              isLoading={lifeCyclesQuery.isLoading || lifeCyclesQuery.isFetching}
              search={searchDraft}
              page={pagination.page}
              limit={pagination.limit}
              total={total}
              totalPages={lifeCyclesQuery.data?.pagination?.totalPages || 1}
              onSearchChange={setSearchDraft}
              onPageChange={(value) => setPagination({ page: value })}
              onEdit={openEdit}
              onDelete={(item) => setDeleteCandidate(item)}
              onCreate={openCreate}
            />
          </div>
        </div>
      </main>

      <LeadLifeCycleFormModal
        isOpen={formState.isModalOpen}
        mode={formState.mode}
        selectedLifeCycle={selectedLifeCycle}
        stageOptions={stageOptionsQuery.data || []}
        existingNames={existingNames}
        isSubmitting={isSubmitting}
        isLoadingStages={stageOptionsQuery.isLoading || stageOptionsQuery.isFetching}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <AnimatePresence>
        {deleteCandidate ? (
          <div className="fixed inset-0 z-[130] flex items-end justify-center p-3 sm:items-center sm:p-4">
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
              className="relative w-full max-w-md rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:p-5"
            >
              <h3 className="text-base font-black text-gray-900">Delete lead life cycle?</h3>
              <p className="mt-1 text-sm text-gray-500">
                This will delete <span className="font-bold text-gray-700">{deleteCandidate.name}</span> if not used in leads.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-black text-white hover:bg-red-600 disabled:opacity-70"
                >
                  {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default LeadLifeCyclePage;
