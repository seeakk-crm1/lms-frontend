import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Plus, Search, Tags } from 'lucide-react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import SearchableSelect from '../../../components/SearchableSelect';
import useAuthStore from '../../../store/useAuthStore';
import {
  useCreateExtensionReason,
  useDeleteExtensionReason,
  useExtensionReasonsQuery,
  useToggleExtensionReason,
  useUpdateExtensionReason,
} from '../hooks/useFollowUpExtensionReasons';
import useExtensionReasonStore from '../store/followupExtensionReasonsStore';
import ExtensionReasonTable from '../components/ExtensionReasonTable';
import type { ExtensionReason, ExtensionReasonPayload } from '../types/followUpExtensionReason.types';
import { lazyWithChunkRecovery } from '../../../utils/chunkLoadRecovery';

const ExtensionReasonModal = lazyWithChunkRecovery(() => import('../components/ExtensionReasonModal'));

const roleKey = (role: unknown) =>
  String(typeof role === 'object' && role !== null ? (role as { name?: string }).name || '' : role || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, '');

const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const FollowUpExtensionReasonsPage: React.FC = () => {
  const [searchDraft, setSearchDraft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<ExtensionReason | null>(null);

  const { user } = useAuthStore();
  const { search, isActive, page, setSearch, setIsActive, resetFilters, setPage } = useExtensionReasonStore();

  const reasonsQuery = useExtensionReasonsQuery();
  const createMutation = useCreateExtensionReason();
  const updateMutation = useUpdateExtensionReason();
  const toggleMutation = useToggleExtensionReason();
  const deleteMutation = useDeleteExtensionReason();

  const normalizedRole = roleKey(user?.role);
  const canManage = ['admin', 'superadmin'].includes(normalizedRole) || (user?.permissions || []).includes('manage_followup_extension_reasons');

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchDraft), 300);
    return () => window.clearTimeout(timer);
  }, [searchDraft, setSearch]);

  const rows = reasonsQuery.data?.data || [];
  const pagination = reasonsQuery.data?.pagination;

  const appliedFilterChips = useMemo(
    () => [
      search ? `Search: ${search}` : null,
      isActive !== 'ALL' ? `Status: ${isActive ? 'Active' : 'Inactive'}` : null,
    ].filter(Boolean) as string[],
    [search, isActive],
  );

  const handleSave = async (payload: ExtensionReasonPayload) => {
    try {
      if (modalReason?.id) {
        await updateMutation.mutateAsync({ id: modalReason.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
      setModalReason(null);
    } catch {
      // Keep modal open for corrections
    }
  };

  const handleDelete = async (item: ExtensionReason) => {
    if (window.confirm(`Are you sure you want to delete "${item.reasonName}"?`)) {
      await deleteMutation.mutateAsync(item.id);
    }
  };

  return (
    <DashboardLayout>
      <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="absolute right-0 top-0 -z-10 h-[420px] w-[720px] bg-gradient-to-bl from-emerald-50 via-transparent to-transparent" />

        <div className="mx-auto max-w-[1480px] space-y-6 md:space-y-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-emerald-600">
                <Tags className="h-3.5 w-3.5" />
                <span>Follow-Up Rescheduling</span>
              </div>
              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Follow-Up Extension Reasons</h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold text-gray-500">
                Configure standardized follow-up extension / snooze reasons for reminders and calendar dates.
              </p>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_220px_auto]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Search reasons"
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <SearchableSelect
                options={statusOptions.map((option) => ({ value: option.value, label: option.label }))}
                value={isActive === 'ALL' ? 'ALL' : isActive ? 'ACTIVE' : 'INACTIVE'}
                onChange={(event) => {
                  const val = event.target.value;
                  if (val === 'ALL') setIsActive('ALL');
                  else if (val === 'ACTIVE') setIsActive(true);
                  else setIsActive(false);
                }}
                placeholder="Filter status"
                name="isActive"
              />

              {canManage ? (
                <button
                  type="button"
                  onClick={() => {
                    setModalReason(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.8)] transition-all hover:bg-emerald-600 sm:col-span-2 xl:col-span-1"
                >
                  <Plus className="h-4 w-4" />
                  Create Reason
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm">
              <Filter className="h-4 w-4 text-gray-400" />
              <span>{appliedFilterChips.length ? 'Filters applied' : 'No filters applied'}</span>
            </div>

            {appliedFilterChips.map((chip) => (
              <span key={chip} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
                {chip}
              </span>
            ))}

            {appliedFilterChips.length ? (
              <button
                type="button"
                onClick={() => {
                  setSearchDraft('');
                  resetFilters();
                }}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                Reset
              </button>
            ) : null}
          </div>

          <section className="rounded-[2rem] border border-white/70 bg-white p-4 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.18)] sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Reasons Registry</h2>
                <p className="mt-1 text-sm font-semibold text-gray-500">
                  Manage snooze and postponement reasons for reminders.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm font-black text-gray-600">
                {pagination?.total || rows.length} configured
              </div>
            </div>

            <ExtensionReasonTable
              rows={rows}
              loading={reasonsQuery.isLoading}
              canManage={canManage}
              onEdit={(item) => {
                setModalReason(item);
                setIsModalOpen(true);
              }}
              onToggleStatus={(item) =>
                toggleMutation.mutate({
                  id: item.id,
                  isActive: !item.isActive,
                })
              }
              onDelete={handleDelete}
            />

            {pagination && pagination.totalPages > 1 ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-black text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <Suspense fallback={null}>
        <ExtensionReasonModal
          open={isModalOpen}
          initialValue={modalReason}
          onClose={() => {
            setIsModalOpen(false);
            setModalReason(null);
          }}
          onSubmit={handleSave}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Suspense>
    </DashboardLayout>
  );
};

export default FollowUpExtensionReasonsPage;
