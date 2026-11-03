import React, { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, History, RotateCcw, Wallet } from 'lucide-react';
import WhatsAppActionButton from '../../../components/common/WhatsAppActionButton';
import { LEAD_WHATSAPP_PERMISSIONS } from '../../../constants/whatsappPermissions';
import type { LeadListItem } from '../../../types/lead.types';
import { stageBadgeStyle } from '../../../utils/leadStageColor';
import { formatPhoneWithFlag } from '../../../utils/phoneUtils';

interface ClosedLeadsTableProps {
  items: LeadListItem[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  canReopen: boolean;
  onPageChange: (page: number) => void;
  onView: (lead: LeadListItem, tab?: 'overview' | 'history') => void;
  onReopen: (lead: LeadListItem) => void;
}

import { formatCurrency } from '../../../utils/currency';

const ClosedLeadsTable: React.FC<ClosedLeadsTableProps> = ({
  items,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  canReopen,
  onPageChange,
  onView,
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
    <div className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-[1250px] w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-xs">
            <tr className="border-b border-gray-200/80">
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
                  className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`closed-lead-skeleton-${index}`} className="animate-pulse">
                  {Array.from({ length: 10 }).map((__, cellIndex) => (
                    <td key={`closed-cell-${cellIndex}`} className="px-3.5 py-3">
                      <div className="h-4 rounded-lg shimmer-bg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <h3 className="text-base font-bold text-gray-900">No closed leads match the current filters</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Try widening the closure type, ownership, or revenue range to inspect more deals.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((lead, index) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="group transition-colors hover:bg-emerald-50/30"
                >
                  <td className="px-3.5 py-2.5 sm:py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onView(lead, 'overview')}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-slate-800 hover:bg-gray-100 transition-colors"
                        aria-label={`View ${lead.name}`}
                        title="View overview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onView(lead, 'history')}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        aria-label={`View ${lead.name} history`}
                        title="View history"
                      >
                        <History className="h-3.5 w-3.5" />
                      </button>
                      {canReopen ? (
                        <button
                          type="button"
                          onClick={() => onReopen(lead)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          aria-label={`Reopen ${lead.name}`}
                          title="Reopen lead"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                      <WhatsAppActionButton
                        phone={lead.phone}
                        variant="table"
                        stopPropagation
                        requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                        audit={{
                          entityType: 'Lead',
                          entityId: lead.id,
                          entityName: lead.name,
                        }}
                      />
                    </div>
                  </td>

                  <td className="px-3.5 py-2.5 sm:py-3">
                    <div className="max-w-[200px]">
                      <div className="truncate text-xs sm:text-sm font-semibold text-gray-900">{lead.name}</div>
                      <div className="mt-0.5 space-y-0.5">
                        <div className="truncate text-[11px] font-medium text-gray-500">{lead.email || 'No email'}</div>
                        <div className="flex items-center gap-1 min-w-0">
                          <div className="truncate text-[11px] font-medium text-gray-500">{lead.phone ? formatPhoneWithFlag(lead.phone) : 'No phone'}</div>
                          <WhatsAppActionButton
                            phone={lead.phone}
                            variant="inline"
                            stopPropagation
                            requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                            audit={{
                              entityType: 'Lead',
                              entityId: lead.id,
                              entityName: lead.name,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-3.5 py-2.5 sm:py-3">
                    <div className="text-xs font-bold text-gray-800 truncate">{lead.assignedTo?.displayName || 'Unassigned'}</div>
                    <div className="text-[10px] font-medium text-gray-400 truncate">{lead.assignedTo?.email || 'No owner email'}</div>
                  </td>

                  <td className="px-3.5 py-2.5 sm:py-3">
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={stageBadgeStyle(lead.stage?.color)}
                    >
                      {lead.stage?.name || 'Closed'}
                    </span>
                  </td>

                  <td className="px-3.5 py-2.5 sm:py-3 text-xs font-medium text-gray-600">{lead.lifecycle?.name || '—'}</td>
                  <td className="px-3.5 py-2.5 sm:py-3 text-xs font-medium text-gray-600">{lead.source?.name || '—'}</td>

                  <td className="px-3.5 py-2.5 sm:py-3 text-xs font-semibold text-gray-500">
                    {formatCurrency(lead.expectedRevenue || 0)}
                  </td>

                  <td className="px-3.5 py-2.5 sm:py-3">
                    <div className={`text-xs sm:text-sm font-bold ${lead.closureType === 'WON' ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {formatCurrency(lead.totalAmount || lead.generatedRevenue || 0)}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {lead.closureType || 'Pending'}
                    </div>
                  </td>

                  <td className="px-3.5 py-2.5 sm:py-3">
                    <div className="text-xs font-bold text-gray-800">{format(new Date(lead.createdAt), 'dd MMM yyyy')}</div>
                    <div className="text-[10px] font-medium text-gray-400">{format(new Date(lead.createdAt), 'hh:mm a')}</div>
                  </td>

                  <td className="px-3.5 py-2.5 sm:py-3">
                    <div className="text-xs font-bold text-gray-800">{format(new Date(lead.updatedAt), 'dd MMM yyyy')}</div>
                    <div className="text-[10px] font-medium text-gray-400">{format(new Date(lead.updatedAt), 'hh:mm a')}</div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-gray-100 bg-gray-50/60 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-gray-500">
          Showing <span className="text-gray-900 font-bold">{rangeStart}-{rangeEnd}</span> of <span className="text-gray-900 font-bold">{total}</span> closed leads
        </p>
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {pageNumbers.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                item === page
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
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
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ClosedLeadsTable);
