import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Archive, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import type { LeadListItem } from '../../../types/lead.types';
import FollowUpBadge from './FollowUpBadge';

interface LeadsTableProps {
  items: LeadListItem[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isSelectionMode: boolean;
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (lead: LeadListItem) => void;
  onDelete: (lead: LeadListItem) => void;
}

const emptyCell = 'text-gray-300';

const stageBadgeClass = (color?: string | null) =>
  color
    ? { backgroundColor: `${color}18`, color }
    : { backgroundColor: '#f3f4f6', color: '#6b7280' };

const LeadsTable: React.FC<LeadsTableProps> = ({
  items,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  isSelectionMode,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
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
  
  const pageIds = items.map((l) => l.id);
  const safeSelectedIds = selectedIds || [];
  const allSelected = pageIds.length > 0 && pageIds.every((id) => safeSelectedIds.includes(id));

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
            <tr className="border-b border-gray-100">
              {isSelectionMode && (
                <motion.th 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 48 }}
                  className="px-6 py-4 w-12"
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 transition-all cursor-pointer"
                    aria-label="Select all on page"
                  />
                </motion.th>
              )}
              {['Lead Name', 'Next Follow-Up', 'Assigned To', 'Stage', 'Lead Life Cycle', 'Source', 'Created Date', 'Actions'].map((heading) => (
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
                <tr key={`lead-skeleton-${index}`} className="animate-pulse">
                  {isSelectionMode && (
                    <td className="px-6 py-5">
                      <div className="h-4 w-4 rounded bg-gray-200" />
                    </td>
                  )}
                  {Array.from({ length: 8 }).map((__, cellIndex) => (
                    <td key={`cell-${cellIndex}`} className="px-6 py-5">
                      <div className="h-5 rounded-xl shimmer-bg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={isSelectionMode ? 9 : 8} className="px-6 py-20 text-center">
                  <div className="mx-auto max-w-sm">
                    <h3 className="text-lg font-black text-gray-900">No leads match the current filters</h3>
                    <p className="mt-2 text-sm font-semibold text-gray-500">
                      Adjust the stage, owner, or source filters, or create a new lead from the header action.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((lead, index) => {
                const isSelected = safeSelectedIds.includes(lead.id);
                return (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group transition-colors hover:bg-emerald-50/35 ${isSelectionMode && isSelected ? 'bg-emerald-50/20' : ''}`}
                >
                  {isSelectionMode && (
                    <motion.td 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-6 py-5"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelection(lead.id)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 transition-all cursor-pointer shadow-sm hover:scale-110"
                        aria-label={`Select ${lead.name}`}
                      />
                    </motion.td>
                  )}
                  <td className="px-6 py-5">
                    <div className="max-w-[220px]">
                      <div className="truncate text-sm font-black text-gray-900">{lead.name}</div>
                      <div className="mt-1 space-y-0.5">
                        <div className={`truncate text-xs font-semibold ${lead.email ? 'text-gray-500' : emptyCell}`}>
                          {lead.email || 'No email'}
                        </div>
                        <div className={`truncate text-xs font-semibold ${lead.phone ? 'text-gray-500' : emptyCell}`}>
                          {lead.phone || 'No phone'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <FollowUpBadge value={lead.nextFollowUpAt} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-gray-900">
                      {lead.assignedTo?.displayName || 'Unassigned'}
                    </div>
                    <div className="text-xs font-semibold text-gray-400">{lead.assignedTo?.email || 'Assign owner'}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest"
                      style={stageBadgeClass(lead.stage?.color)}
                    >
                      {lead.stage?.name || 'No stage'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-gray-600">
                    {lead.lifecycle?.name || 'No lifecycle'}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-gray-600">
                    {lead.source?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-gray-900">{format(new Date(lead.createdAt), 'dd MMM yyyy')}</div>
                    <div className="text-xs font-semibold text-gray-400">{format(new Date(lead.createdAt), 'hh:mm a')}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      {lead.deletedAt ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-gray-500">
                          Archived
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onEdit(lead)}
                            className="rounded-2xl bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-100"
                            aria-label={`Edit ${lead.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(lead)}
                            className="rounded-2xl bg-amber-50 p-2 text-amber-600 transition-all hover:bg-amber-100"
                            aria-label={`Archive ${lead.name}`}
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
            Showing <span className="text-gray-900">{rangeStart}-{rangeEnd}</span> of <span className="text-gray-900">{total}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">View</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-xl border border-gray-200 bg-white px-2 py-1 text-xs font-black text-gray-700 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer hover:border-gray-300"
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>

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

export default memo(LeadsTable);
