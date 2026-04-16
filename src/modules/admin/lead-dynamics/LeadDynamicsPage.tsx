import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Braces, CheckCircle2, Loader2, Plus } from 'lucide-react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import LeadDynamicsModal from './LeadDynamicsModal';
import LeadDynamicsTable from './LeadDynamicsTable';
import { useLeadDynamicsStore } from './leadDynamics.store';
import {
  useCreateFieldMutation,
  useDeleteFieldMutation,
  useUpdateFieldMutation,
} from './useLeadDynamicsMutation';
import { useLeadDynamicsQuery } from './useLeadDynamicsQuery';
import type { LeadDynamicField, LeadDynamicsFormValues } from './types';

const LeadDynamicsPage: React.FC = () => {
  const [searchDraft, setSearchDraft] = useState('');

  const {
    fields,
    selectedField,
    modalState,
    deleteCandidate,
    filters,
    pagination,
    setFields,
    openModal,
    closeModal,
    resetForm,
    setDeleteCandidate,
    setFilters,
    setPagination,
  } = useLeadDynamicsStore();

  const { data, isLoading, isFetching } = useLeadDynamicsQuery();
  const createMutation = useCreateFieldMutation();
  const updateMutation = useUpdateFieldMutation();
  const deleteMutation = useDeleteFieldMutation();

  useEffect(() => {
    const timer = setTimeout(() => setFilters({ search: searchDraft.trim() }), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, setFilters]);

  useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (!data) return;
    setFields(data.data || []);
    setPagination({
      total: data.pagination?.total || 0,
      totalPages: data.pagination?.totalPages || 1,
    });
  }, [data, setFields, setPagination]);

  const total = data?.pagination?.total || 0;
  const activeCount = useMemo(() => fields.filter((item) => item.isActive).length, [fields]);
  const selectableCount = useMemo(
    () => fields.filter((item) => ['SELECT', 'RADIO', 'CHECKBOX'].includes(item.inputType)).length,
    [fields],
  );

  const stats = useMemo(
    () => [
      { label: 'Total Fields', value: total, icon: Braces, color: 'emerald' },
      { label: 'Active Fields', value: activeCount, icon: CheckCircle2, color: 'blue' },
      { label: 'Selectable Fields', value: selectableCount, icon: Braces, color: 'amber' },
    ],
    [activeCount, selectableCount, total],
  );

  const existingNames = useMemo(() => fields.map((item) => item.name), [fields]);
  const suggestedSortOrder = useMemo(
    () => (fields.length ? Math.max(...fields.map((item) => item.sortOrder)) + 1 : 1),
    [fields],
  );

  const openCreateModal = useCallback(() => openModal('create', null), [openModal]);
  const openEditModal = useCallback((field: LeadDynamicField) => openModal('edit', field), [openModal]);

  const handleSubmit = useCallback(
    async (payload: LeadDynamicsFormValues) => {
      try {
        if (modalState.mode === 'edit' && selectedField) {
          await updateMutation.mutateAsync({ id: selectedField.id, payload });
        } else {
          await createMutation.mutateAsync(payload);
        }
        resetForm();
      } catch {
        // Error toast is handled in mutation onError.
      }
    },
    [createMutation, modalState.mode, resetForm, selectedField, updateMutation],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteCandidate) return;
    try {
      await deleteMutation.mutateAsync(deleteCandidate.id);
      setDeleteCandidate(null);
    } catch {
      // Error toast is handled in mutation onError.
    }
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
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Lead Dynamics Fields</h1>
                <p className="text-sm text-gray-500 mt-1">Configure custom fields for lead forms</p>
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
                Add Field
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

            <LeadDynamicsTable
              items={fields}
              isLoading={isLoading || isFetching}
              search={searchDraft}
              status={filters.status}
              page={pagination.page}
              limit={pagination.limit}
              total={total}
              totalPages={data?.pagination?.totalPages || 1}
              onSearchChange={setSearchDraft}
              onStatusChange={(value) => setFilters({ status: value })}
              onPageChange={(value) => setPagination({ page: value })}
              onEdit={openEditModal}
              onDelete={(item) => setDeleteCandidate(item)}
            />
          </div>
        </div>

      <LeadDynamicsModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        selectedField={selectedField}
        existingNames={existingNames}
        suggestedSortOrder={suggestedSortOrder}
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
              className="relative w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-xl p-4 sm:p-5"
            >
              <h3 className="text-base font-black text-gray-900">Delete field?</h3>
              <p className="text-sm text-gray-500 mt-1">
                This will remove <span className="font-bold text-gray-700">{deleteCandidate.name}</span>.
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

export default LeadDynamicsPage;
