import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, History, RotateCcw, Wallet } from 'lucide-react';
import type { LeadListItem } from '../../../types/lead.types';

interface ClosedLeadsTableProps {
  items: LeadListItem[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  canEditRevenue: boolean;
  canReopen: boolean;
  onPageChange: (page: number) => void;
  onView: (lead: LeadListItem, tab?: 'overview' | 'history') => void;
  onEditRevenue: (lead: LeadListItem) => void;
  onReopen: (lead: LeadListItem) => void;
}

const moneyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const stageBadgeClass = (color?: string | null) =>
  color
    ? { backgroundColor: `${color}18`, color }
    : { backgroundColor: '#f3f4f6', color: '#6b7280' };

const ClosedLeadsTable: React.FC<ClosedLeadsTableProps> = ({
  items,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  canEditRevenue,
  canReopen,
  onPageChange,
  onView,
  onEditRevenue,
  onReopen,
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

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1400px] w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
            <tr className="border-b border-gray-100">
              {[
                'Action',
                'Lead Name',
                'Assigned To',
                'Stage',
                'Life Cycle',
                'Source',
                'Expected Revenue',
                'Generated Revenue',
                'Created Date',
                'Modified Date',
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 7 }).map((_, index) => (
                <tr key={`closed-lead-skeleton-${index}`} className="animate-pulse">
                  {Array.from({ length: 10 }).map((__, cellIndex) => (
                    <td key={`closed-cell-${cellIndex}`} className="px-6 py-5">
                      <div className="h-5 rounded-xl shimmer-bg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-20 text-center">
                  <div className="mx-auto max-w-sm">
                    <h3 className="text-lg font-black text-gray-900">No closed leads match the current filters</h3>
                    <p className="mt-2 text-sm font-semibold text-gray-500">
                      Try widening the closure type, ownership, or revenue range to inspect more deals.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group transition-colors hover:bg-emerald-50/35"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onView(lead, 'overview')}
                        className="rounded-2xl bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100"
                        aria-label={`View ${lead.name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onView(lead, 'history')}
                        className="rounded-2xl bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-100"
                        aria-label={`View ${lead.name} history`}
                      >
                        <History className="h-4 w-4" />
                      </button>
                      {canReopen ? (
                        <button
                          type="button"
                          onClick={() => onReopen(lead)}
                          className="rounded-2xl bg-amber-50 p-2 text-amber-600 transition-all hover:bg-amber-100"
                          aria-label={`Reopen ${lead.name}`}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      ) : null}
                      {canEditRevenue ? (
                        <button
                          type="button"
                          onClick={() => onEditRevenue(lead)}
                          className="rounded-2xl bg-emerald-50 p-2 text-emerald-600 transition-all hover:bg-emerald-100"
                          aria-label={`Edit revenue for ${lead.name}`}
                        >
                          <Wallet className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="max-w-[220px]">
                      <div className="truncate text-sm font-black text-gray-900">{lead.name}</div>
                      <div className="mt-1 space-y-0.5">
                        <div className="truncate text-xs font-semibold text-gray-500">{lead.email || 'No email'}</div>
                        <div className="truncate text-xs font-semibold text-gray-500">{lead.phone || 'No phone'}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-gray-900">{lead.assignedTo?.displayName || 'Unassigned'}</div>
                    <div className="text-xs font-semibold text-gray-400">{lead.assignedTo?.email || 'No owner email'}</div>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest"
                      style={stageBadgeClass(lead.stage?.color)}
                    >
                      {lead.stage?.name || 'Closed'}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-sm font-semibold text-gray-600">{lead.lifecycle?.name || 'Default'}</td>
                  <td className="px-6 py-5 text-sm font-semibold text-gray-600">{lead.source?.name || 'Unknown'}</td>

                  <td className="px-6 py-5 text-sm font-bold text-gray-400">
                    {moneyFormatter.format(lead.expectedRevenue || 0)}
                  </td>

                  <td className="px-6 py-5">
                    <div className={`text-base font-black ${lead.closureType === 'WON' ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {moneyFormatter.format(lead.generatedRevenue || 0)}
                    </div>
                    <div className="mt-1 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                      {lead.closureType || 'Pending'}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-gray-900">{format(new Date(lead.createdAt), 'dd MMM yyyy')}</div>
                    <div className="text-xs font-semibold text-gray-400">{format(new Date(lead.createdAt), 'hh:mm a')}</div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-gray-900">{format(new Date(lead.updatedAt), 'dd MMM yyyy')}</div>
                    <div className="text-xs font-semibold text-gray-400">{format(new Date(lead.updatedAt), 'hh:mm a')}</div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
          Showing <span className="text-gray-900">{rangeStart}-{rangeEnd}</span> of <span className="text-gray-900">{total}</span> closed leads
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
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
              }`}
              aria-label={`Page ${item}`}
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

export default memo(ClosedLeadsTable);
