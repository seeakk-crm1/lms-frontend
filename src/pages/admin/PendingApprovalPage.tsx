import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCheck, Clock3, Filter, Search, ShieldCheck, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useApprovalActionMutation, useApprovalsQuery } from '../../hooks/useApprovals';
import useApprovalStore from '../../store/approvalStore';
import type { LeadApprovalAction, LeadApprovalListItem } from '../../types/lead.types';
import ApprovalModal from './pending-approval/components/ApprovalModal';
import ApprovalTable from './pending-approval/components/ApprovalTable';
import useAuthStore from '../../store/useAuthStore';
import { hasPermission } from '../../utils/permission.util';

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

  const user = useAuthStore((state) => state.user);
  const canApprove = hasPermission(user?.permissions || [], 'LEAD_APPROVAL_APPROVE');
  const canDeny = hasPermission(user?.permissions || [], 'LEAD_APPROVAL_DENY');
  const canAct = canApprove || canDeny;

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
    async (payload: { action: LeadApprovalAction; comment: string; earnedRevenue?: number; checkNumber?: string }) => {
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
      <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-3.5 sm:p-5 lg:p-6">
        <div className="absolute right-0 top-0 -z-10 h-[360px] w-[560px] bg-gradient-to-bl from-amber-50/60 via-transparent to-transparent pointer-events-none" />

        <div className="mx-auto max-w-[1560px] space-y-3.5 sm:space-y-4">
          <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="2xl:max-w-[36rem]">
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-100/80">
                <ShieldCheck className="h-3 w-3" />
                <span>Governed Pipeline Control</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Pending Approval</h1>
              <p className="mt-0.5 text-xs text-gray-500">
                Manage lead stage approval requests, review context, and keep high-risk transitions auditable.
              </p>
            </motion.div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  placeholder="Search lead or approver"
                  className="h-9 w-full rounded-lg border border-gray-200/90 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-gray-900 shadow-xs outline-none transition-all placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  aria-label="Search approvals"
                />
              </div>

              <select
                value={filters.status || ''}
                onChange={(event) => handleFilterChange('status', event.target.value)}
                className="h-9 rounded-lg border border-gray-200/90 bg-white px-2.5 text-xs font-semibold text-gray-700 shadow-xs outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100 cursor-pointer"
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
                className="h-9 w-[130px] rounded-lg border border-gray-200/90 bg-white px-2.5 text-xs font-medium text-gray-700 shadow-xs outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                aria-label="Filter from date"
              />

              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(event) => handleFilterChange('dateTo', event.target.value)}
                className="h-9 w-[130px] rounded-lg border border-gray-200/90 bg-white px-2.5 text-xs font-medium text-gray-700 shadow-xs outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                aria-label="Filter to date"
              />

              {(filters.search || filters.status || filters.dateFrom || filters.dateTo) ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-9 px-3 rounded-lg border border-gray-200/80 bg-white text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="h-[76px] sm:h-[80px] rounded-xl border border-gray-200/80 bg-white p-3 sm:p-3.5 shadow-xs flex items-center justify-between hover:border-gray-300 transition-all"
              >
                <div>
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400">{stat.label}</div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none mt-1">{stat.value}</div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600 border border-gray-100">
                  <stat.icon className="h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-xs">
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
