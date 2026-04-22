import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CheckCircle2, Loader2, Plus } from 'lucide-react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import OfficeFormModal from '../../../components/admin/office/OfficeFormModal';
import OfficeTable from '../../../components/admin/office/OfficeTable';
import {
  useCreateOfficeMutation,
  useDeleteOfficeMutation,
  useLocationsQuery,
  useOfficesQuery,
  useToggleOfficeStatusMutation,
  useUpdateOfficeMutation,
} from '../../../hooks/admin/office/useOfficeQuery';
import { useOfficeStore } from '../../../store/admin/office/officeStore';
import type { Office, OfficeFormValues } from '../../../types/admin/office/office.types';

const OfficePage: React.FC = () => {
  const [searchDraft, setSearchDraft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<Office | null>(null);

  const {
    offices,
    filters,
    search,
    pagination,
    selectedOffice,
    setOffices,
    setFilters,
    setSearch,
    setPagination,
    setSelectedOffice,
    resetForm,
  } = useOfficeStore();

  const officesQuery = useOfficesQuery();
  const locationsQuery = useLocationsQuery();
  const createMutation = useCreateOfficeMutation();
  const updateMutation = useUpdateOfficeMutation();
  const deleteMutation = useDeleteOfficeMutation();
  const toggleStatusMutation = useToggleOfficeStatusMutation();

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchDraft.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchDraft, setSearch]);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    if (!officesQuery.data) return;
    setOffices(officesQuery.data.data.offices || []);
    setPagination({
      total: officesQuery.data.data.pagination?.total || 0,
      totalPages: officesQuery.data.data.pagination?.totalPages || 1,
    });
  }, [officesQuery.data, setOffices, setPagination]);

  const openCreate = useCallback(() => {
    setSelectedOffice(null);
    setIsModalOpen(true);
  }, [setSelectedOffice]);

  const openEdit = useCallback(
    (office: Office) => {
      setSelectedOffice(office);
      setIsModalOpen(true);
    },
    [setSelectedOffice],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(
    async (payload: OfficeFormValues) => {
      try {
        if (selectedOffice) {
          await updateMutation.mutateAsync({ id: selectedOffice.id, payload });
        } else {
          await createMutation.mutateAsync(payload);
        }
        closeModal();
      } catch {
        // handled by mutation toasts
      }
    },
    [closeModal, createMutation, selectedOffice, updateMutation],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteCandidate) return;
    try {
      await deleteMutation.mutateAsync(deleteCandidate.id);
      setDeleteCandidate(null);
    } catch {
      // handled by mutation toasts
    }
  }, [deleteCandidate, deleteMutation]);

  const handleToggleStatus = useCallback(
    async (office: Office) => {
      try {
        await toggleStatusMutation.mutateAsync({
          id: office.id,
          isActive: !office.isActive,
        });
      } catch {
        // handled by mutation toasts
      }
    },
    [toggleStatusMutation],
  );

  const total = officesQuery.data?.data.pagination?.total || 0;
  const activeCount = useMemo(() => offices.filter((office) => office.isActive).length, [offices]);
  const stats = useMemo(
    () => [
      { label: 'Total Offices', value: total, icon: Building2, color: 'emerald' },
      { label: 'Active Offices', value: activeCount, icon: CheckCircle2, color: 'blue' },
      { label: 'Inactive Offices', value: Math.max(0, total - activeCount), icon: Building2, color: 'amber' },
    ],
    [activeCount, total],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout>
        <div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar relative p-4 md:p-8">
          <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-gradient-to-bl from-emerald-50/80 via-transparent to-transparent pointer-events-none -z-10" />

          <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                    Master Configuration
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Office Locations</h1>
                <p className="text-sm text-gray-500 max-w-lg mt-1">
                  Manage office branches for user mapping, lead assignment and reporting.
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreate}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
              >
                <Plus className="w-4 h-4" />
                + Add Office Location
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
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

            <OfficeTable
              offices={offices}
              locations={locationsQuery.data || []}
              isLoading={officesQuery.isLoading || officesQuery.isFetching}
              search={searchDraft}
              status={filters.status}
              countryId={filters.countryId}
              stateId={filters.stateId}
              districtId={filters.districtId}
              page={pagination.page}
              limit={pagination.limit}
              total={total}
              totalPages={officesQuery.data?.data.pagination?.totalPages || 1}
              onSearchChange={setSearchDraft}
              onStatusChange={(value) => setFilters({ status: value })}
              onCountryChange={(value) => setFilters({ countryId: value })}
              onStateChange={(value) => setFilters({ stateId: value })}
              onDistrictChange={(value) => setFilters({ districtId: value })}
              onPageChange={(value) => setPagination({ page: value })}
              onEdit={openEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={setDeleteCandidate}
              onCreate={openCreate}
            />
          </div>
        </div>

      <OfficeFormModal
        isOpen={isModalOpen}
        office={selectedOffice}
        isSubmitting={isSubmitting}
        locations={locationsQuery.data || []}
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
              <h3 className="text-base font-black text-gray-900">Delete office location?</h3>
              <p className="text-sm text-gray-500 mt-1">
                This will deactivate/delete <span className="font-bold text-gray-700">{deleteCandidate.name}</span>.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setDeleteCandidate(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-black text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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

export default OfficePage;
