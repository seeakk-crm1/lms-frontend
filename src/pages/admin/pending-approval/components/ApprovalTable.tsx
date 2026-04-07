import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import type { LeadApprovalListItem } from '../../../../types/lead.types';
import ApprovalRow from './ApprovalRow';
import StatusBadge from './StatusBadge';

interface ApprovalTableProps {
  items: LeadApprovalListItem[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  canAct: boolean;
  sortBy: 'createdAt' | 'updatedAt' | 'status' | 'leadName';
  sortDirection: 'asc' | 'desc';
  onPageChange: (page: number) => void;
  onSort: (key: 'createdAt' | 'updatedAt' | 'status' | 'leadName') => void;
  onReview: (approval: LeadApprovalListItem) => void;
  onHistory: (approval: LeadApprovalListItem) => void;
}

const ApprovalTable: React.FC<ApprovalTableProps> = ({
  items,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  canAct,
  sortBy,
  sortDirection,
  onPageChange,
  onSort,
  onReview,
  onHistory,
}) => {
  const pageNumbers = useMemo(() => {
    const numbers: number[] = [];
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages, start + 2);
    for (let index = start; index <= end; index += 1) {
      numbers.push(index);
    }
    return numbers;
  }, [page, totalPages]);

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * limit, total);

  const sortableHeadingClass = (key: 'createdAt' | 'updatedAt' | 'status' | 'leadName') =>
    `inline-flex items-center gap-1 transition-colors ${sortBy === key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`;

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[1260px] w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Action</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em]">
                <button type="button" onClick={() => onSort('leadName')} className={sortableHeadingClass('leadName')}>
                  <span>Lead Name</span>
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">Assignee</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">From Stage</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">To Stage</th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em]">
                <button type="button" onClick={() => onSort('status')} className={sortableHeadingClass('status')}>
                  <span>Status</span>
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em]">
                <button type="button" onClick={() => onSort('createdAt')} className={sortableHeadingClass('createdAt')}>
                  <span>Created Date</span>
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em]">
                <button type="button" onClick={() => onSort('updatedAt')} className={sortableHeadingClass('updatedAt')}>
                  <span>Modified Date</span>
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={`approval-skeleton-${index}`} className="animate-pulse">
                  {Array.from({ length: 8 }).map((__, cellIndex) => (
                    <td key={`approval-cell-${cellIndex}`} className="px-6 py-5">
                      <div className="h-5 rounded-xl shimmer-bg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center">
                  <div className="mx-auto max-w-md">
                    <h3 className="text-lg font-black text-gray-900">No approval requests match the current filters</h3>
                    <p className="mt-2 text-sm font-semibold text-gray-500">
                      Try widening the status or date window to review more lead stage approval activity.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((approval) => (
                <ApprovalRow
                  key={approval.id}
                  approval={approval}
                  canAct={canAct}
                  onReview={onReview}
                  onHistory={onHistory}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 p-4 lg:hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={`approval-mobile-skeleton-${index}`} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse">
              <div className="h-5 rounded-xl shimmer-bg" />
              <div className="mt-3 h-4 rounded-xl shimmer-bg" />
              <div className="mt-3 h-4 rounded-xl shimmer-bg" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-12 text-center">
            <h3 className="text-lg font-black text-gray-900">No pending approvals found</h3>
            <p className="mt-2 text-sm font-semibold text-gray-500">Adjust filters or try a different status range.</p>
          </div>
        ) : (
          items.map((approval) => (
            <div key={approval.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-black text-gray-900">{approval.lead?.name || 'Unknown lead'}</div>
                  <div className="mt-1 text-sm font-semibold text-gray-500">
                    {approval.fromStage?.name || 'Unknown'} to {approval.toStage?.name || 'Unknown'}
                  </div>
                </div>
                <StatusBadge status={approval.status} />
              </div>

              <div className="mt-4 grid gap-3 text-sm font-semibold text-gray-600">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Assignee</span>
                  <div className="mt-1 text-gray-900">{approval.assignedTo?.displayName || approval.assignedTo?.name || 'Open queue'}</div>
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Created</span>
                  <div className="mt-1 text-gray-900">{format(new Date(approval.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Updated</span>
                  <div className="mt-1 text-gray-900">{format(new Date(approval.updatedAt), 'dd MMM yyyy, hh:mm a')}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onReview(approval)}
                  disabled={!canAct || approval.status !== 'PENDING'}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                    canAct && approval.status === 'PENDING'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                  }`}
                >
                  Review
                </button>
                <button
                  type="button"
                  onClick={() => onHistory(approval)}
                  className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700 transition-colors hover:bg-gray-50"
                >
                  History
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
          Showing <span className="text-gray-900">{rangeStart}-{rangeEnd}</span> of <span className="text-gray-900">{total}</span> approval requests
        </p>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black transition-all ${
                item === page
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ApprovalTable);
