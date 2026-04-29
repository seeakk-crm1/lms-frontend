import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCheck, Clock3, Filter, Search, ShieldCheck, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useApprovalActionMutation, useApprovalsQuery } from '../../hooks/useApprovals';
import useApprovalStore from '../../store/approvalStore';
import type { LeadApprovalAction, LeadApprovalListItem } from '../../types/lead.types';
import ApprovalModal from './pending-approval/components/ApprovalModal';
import ApprovalTable from './pending-approval/components/ApprovalTable';

const statusOrder: Record<string, number> = {
  PENDING: 0,
  APPROVED: 1,
  DENIED: 2,
};

const PendingApprovalPage: React.FC = () => {
  const [searchDraft, setSearchDraft] = useState('');

  const {
    approvals,
    filters,
    pagination,
    selectedApproval,
    sortBy,
    sortDirection,
    setFilters,
    setPagination,
    setSelectedApproval,
    resetModal,
    setSort,
  } = useApprovalStore();

  const approvalsQuery = useApprovalsQuery();
  const approvalActionMutation = useApprovalActionMutation();

  useEffect(() => {
    setSearchDraft(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters({ search: searchDraft.trim() });
    }, 320);
    return () => window.clearTimeout(timer);
  }, [searchDraft, setFilters]);

  const canApprove = true;
  const canDeny = true;
  const canAct = true;

  const sortedApprovals = useMemo(() => {
    const items = [...approvals];
    const direction = sortDirection === 'asc' ? 1 : -1;

    items.sort((left, right) => {
      if (sortBy === 'leadName') {
        return ((left.lead?.name || '').localeCompare(right.lead?.name || '') || 0) * direction;
      }

      if (sortBy === 'status') {
        return ((statusOrder[left.status] || 99) - (statusOrder[right.status] || 99)) * direction;
      }

      const leftValue = new Date(left[sortBy]).getTime();
      const rightValue = new Date(right[sortBy]).getTime();
      return (leftValue - rightValue) * direction;
    });

    return items;
  }, [approvals, sortBy, sortDirection]);

  const stats = useMemo(
    () => [
      {
        label: 'Pending',
        value: approvals.filter((item) => item.status === 'PENDING').length,
        icon: Clock3,
        accent: 'from-amber-500 to-orange-500',
      },
      {
        label: 'Approved',
        value: approvals.filter((item) => item.status === 'APPROVED').length,
        icon: CheckCheck,
        accent: 'from-emerald-500 to-emerald-600',
      },
      {
        label: 'Denied',
        value: approvals.filter((item) => item.status === 'DENIED').length,
        icon: XCircle,
        accent: 'from-rose-500 to-rose-600',
      },
    ],
    [approvals],
  );

  const handleFilterChange = useCallback(
    (key: 'status' | 'dateFrom' | 'dateTo', value: string) => {
      setFilters({ [key]: value });
    },
    [setFilters],
  );

  const handleResetFilters = useCallback(() => {
    setSearchDraft('');
    setFilters({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    });
  }, [setFilters]);

  const handleSubmitApproval = useCallback(
    async (payload: { action: LeadApprovalAction; comment: string }) => {
      if (!selectedApproval) return;
      await approvalActionMutation.mutateAsync({
        id: selectedApproval.id,
        payload,
      });
      resetModal();
    },
    [approvalActionMutation, resetModal, selectedApproval],
  );

  const handleOpenReview = useCallback((approval: LeadApprovalListItem) => {
    setSelectedApproval(approval);
  }, [setSelectedApproval]);

  const handleOpenHistory = useCallback((approval: LeadApprovalListItem) => {
    setSelectedApproval(approval);
  }, [setSelectedApproval]);

  return (
    <DashboardLayout>
        <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-4 sm:p-5 md:p-8">
          <div className="absolute right-0 top-0 -z-10 h-[460px] w-[720px] bg-gradient-to-bl from-amber-50 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1520px] space-y-6 md:space-y-8">
            <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="2xl:max-w-[40rem]">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-amber-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Governed Pipeline Control</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Pending Approval</h1>
                <p className="mt-2 text-sm font-semibold text-gray-500">
                  Manage lead stage approval requests, review context, and keep high-risk transitions auditable.
                </p>
              </motion.div>

              <div className="grid gap-3 md:grid-cols-2 2xl:min-w-0 2xl:flex-1 2xl:grid-cols-[minmax(260px,1.35fr)_minmax(180px,0.9fr)_minmax(180px,0.9fr)_minmax(180px,0.9fr)] 2xl:items-end">
                <label className="relative md:col-span-2 2xl:col-span-1 2xl:min-w-0">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Search lead or approver"
                    className="w-full min-w-0 rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    aria-label="Search approvals"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2 md:col-span-2 2xl:col-span-3 2xl:grid-cols-3">
                  <select
                    value={filters.status || ''}
                    onChange={(event) => handleFilterChange('status', event.target.value)}
                    className="min-w-0 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    aria-label="Filter by status"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="DENIED">Denied</option>
                  </select>

                  <input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(event) => handleFilterChange('dateFrom', event.target.value)}
                    className="min-w-0 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                    aria-label="Filter from date"
                  />

                  <input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(event) => handleFilterChange('dateTo', event.target.value)}
                    className="min-w-0 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100 sm:col-span-2 md:col-span-1"
                    aria-label="Filter to date"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm">
                <Filter className="h-4 w-4 text-gray-400" />
                <span>
                  {filters.search || filters.status || filters.dateFrom || filters.dateTo
                    ? 'Filters applied'
                    : 'No filters applied'}
                </span>
              </div>
              {(filters.search || filters.status || filters.dateFrom || filters.dateTo) ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              ) : null}
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
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">{stat.label}</div>
                      <div className="mt-3 text-4xl font-black tracking-tight text-gray-900">{stat.value}</div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-500">
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 md:p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Approval Queue</h2>
                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    Review pending transitions, inspect processed requests, and keep the pipeline aligned with approval policy.
                  </p>
                </div>

                {approvalsQuery.error ? (
                  <button
                    type="button"
                    onClick={() => approvalsQuery.refetch()}
                    className="inline-flex self-start rounded-2xl bg-gray-900 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-gray-800"
                  >
                    Retry Load
                  </button>
                ) : null}
              </div>

              {approvalsQuery.error ? (
                <div className="mt-6 flex gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <p className="text-sm font-semibold text-rose-600">
                    {String((approvalsQuery.error as any)?.response?.data?.message || approvalsQuery.error.message || 'Failed to load approval requests')}
                  </p>
                </div>
              ) : null}
            </div>

            <ApprovalTable
              items={sortedApprovals}
              isLoading={approvalsQuery.isLoading || approvalsQuery.isFetching}
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              canAct={canAct}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onPageChange={(page) => setPagination({ page })}
              onSort={setSort}
              onReview={handleOpenReview}
              onHistory={handleOpenHistory}
            />
          </div>
        </div>

      <ApprovalModal
        approval={selectedApproval}
        isSubmitting={approvalActionMutation.isPending}
        canAct={canAct}
        canApprove={canApprove}
        canDeny={canDeny}
        onClose={resetModal}
        onSubmit={handleSubmitApproval}
      />
    </DashboardLayout>
  );
};

export default PendingApprovalPage;
