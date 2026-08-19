import React, { memo, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currency';
import { formatPhoneWithFlag } from '@/utils/phoneUtils';

import { motion } from 'framer-motion';
import { Archive, ChevronLeft, ChevronRight, Pencil, Star, History } from 'lucide-react';
import type { LeadListItem } from '../../../types/lead.types';
import FollowUpBadge from './FollowUpBadge';
import { stageBadgeStyle } from '../../../utils/leadStageColor';
import WhatsAppActionButton from '../../../components/common/WhatsAppActionButton';
import { LEAD_WHATSAPP_PERMISSIONS } from '../../../constants/whatsappPermissions';
import LeadAvatar from './LeadAvatar';
import { getImageUrl } from '../../../utils/getImageUrl';
import { CallButton } from '../../../components/calls/CallButton';
import { CallOutcomeModal } from '../../../components/calls/CallOutcomeModal';
import { useCallTracking } from '../../../hooks/useCallTracking';
import {
  ColumnDefinition,
  STANDARD_TABLE_COLUMNS,
  DEFAULT_VISIBLE_COLUMN_KEYS,
} from '../../../types/leadColumns.types';

interface LeadsTableProps {
  items: LeadListItem[];
  isLoading: boolean;
  isError?: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  isSelectionMode: boolean;
  selectedIds: string[];
  visibleColumns?: ColumnDefinition[];
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onView: (lead: LeadListItem) => void;
  onToggleStar: (lead: LeadListItem) => void;
  onEdit: (lead: LeadListItem) => void;
  onHistory: (lead: LeadListItem) => void;
  onDelete: (lead: LeadListItem) => void;
}

const emptyCell = 'text-gray-300';

const LeadsTable: React.FC<LeadsTableProps> = ({
  items,
  isLoading,
  isError = false,
  page,
  limit,
  total,
  totalPages,
  isSelectionMode,
  selectedIds,
  visibleColumns,
  onToggleSelection,
  onSelectAll,
  onPageChange,
  onLimitChange,
  onView,
  onToggleStar,
  onEdit,
  onHistory,
  onDelete,
}) => {
  const callTracking = useCallTracking();

  const activeColumns = useMemo(() => {
    if (visibleColumns && visibleColumns.length > 0) {
      return visibleColumns;
    }
    return STANDARD_TABLE_COLUMNS.filter((c) => DEFAULT_VISIBLE_COLUMN_KEYS.includes(c.key));
  }, [visibleColumns]);

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

  const [sortAmountDirection, setSortAmountDirection] = useState<'asc' | 'desc' | null>(null);
  const [sortAdvanceAmountDirection, setSortAdvanceAmountDirection] = useState<'asc' | 'desc' | null>(null);
  const [sortRemarkDirection, setSortRemarkDirection] = useState<'asc' | 'desc' | null>(null);

  const sortedItems = useMemo(() => {
    let result = [...items];
    if (sortAmountDirection) {
      result.sort((a, b) => {
        const amtA = (a as any).totalAmount || 0;
        const amtB = (b as any).totalAmount || 0;
        return sortAmountDirection === 'asc' ? amtA - amtB : amtB - amtA;
      });
    } else if (sortAdvanceAmountDirection) {
      result.sort((a, b) => {
        const amtA = a.advanceAmount || 0;
        const amtB = b.advanceAmount || 0;
        return sortAdvanceAmountDirection === 'asc' ? amtA - amtB : amtB - amtA;
      });
    } else if (sortRemarkDirection) {
      result.sort((a, b) => {
        const remA = a.lastRemark || '';
        const remB = b.lastRemark || '';
        return sortRemarkDirection === 'asc' ? remA.localeCompare(remB) : remB.localeCompare(remA);
      });
    }
    return result;
  }, [items, sortAmountDirection, sortAdvanceAmountDirection, sortRemarkDirection]);

  const pageIds = sortedItems.map((l) => l.id);
  const safeSelectedIds = selectedIds || [];
  const allSelected = pageIds.length > 0 && pageIds.every((id) => safeSelectedIds.includes(id));

  const totalColsCount = (isSelectionMode ? 1 : 0) + activeColumns.length + 1;

  const renderCellContent = (lead: LeadListItem, col: ColumnDefinition) => {
    switch (col.key) {
      case 'lead_name':
        return (
          <div className="flex max-w-[260px] items-center gap-3">
            <LeadAvatar name={lead.name} imageUrl={lead.profileImageThumbnail} className="h-11 w-11" />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleStar(lead);
                  }}
                  className={`shrink-0 rounded-lg p-1 transition-all hover:bg-amber-50 ${
                    lead.isStarred ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'
                  }`}
                  aria-label={lead.isStarred ? `Unstar ${lead.name}` : `Star ${lead.name}`}
                  title={lead.isStarred ? 'Unstar lead' : 'Star lead'}
                >
                  <Star className={`h-4 w-4 ${lead.isStarred ? 'fill-current' : ''}`} />
                </button>
                <div className="truncate text-sm font-black text-gray-900">{lead.name}</div>
              </div>
              <div className="mt-1 space-y-0.5">
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="truncate text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <div className={`truncate text-xs font-semibold ${emptyCell}`}>No email</div>
                )}
                <div className="flex items-center gap-1 min-w-0">
                  <div className={`truncate text-xs font-semibold ${lead.phone ? 'text-gray-500' : emptyCell}`}>
                    {lead.phone ? formatPhoneWithFlag(lead.phone) : 'No phone'}
                  </div>
                  <WhatsAppActionButton
                    phone={lead.phone}
                    lead={lead}
                    source="Lead List"
                    variant="inline"
                    stopPropagation
                    requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                    audit={{
                      entityType: 'Lead',
                      entityId: lead.id,
                      entityName: lead.name,
                    }}
                  />
                  <CallButton
                    leadId={lead.id}
                    leadName={lead.name}
                    phone={lead.phone}
                    sourceContext="ALL_LEADS"
                    currentStageName={lead.stage?.name}
                    size="sm"
                    variant="icon"
                    onInitiate={callTracking.startCall}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'next_followup':
        return <FollowUpBadge value={lead.nextFollowUpAt} />;

      case 'assigned_to':
        return (
          <div className="flex items-center gap-3">
            {lead.assignedTo && (
              <div className="h-8 w-8 shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden">
                {lead.assignedTo.profileImageUrl ? (
                  <img
                    src={getImageUrl(lead.assignedTo.profileImageUrl)}
                    alt="Assigned"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  (lead.assignedTo.displayName || lead.assignedTo.email || 'U').charAt(0).toUpperCase()
                )}
              </div>
            )}
            <div>
              <div className="text-sm font-black text-gray-900">
                {lead.assignedTo?.displayName || 'Unassigned'}
              </div>
              <div className="text-xs font-semibold text-gray-400">{lead.assignedTo?.email || 'Assign owner'}</div>
            </div>
          </div>
        );

      case 'lead_stage':
        return (
          <span
            className="inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest"
            style={stageBadgeStyle(lead.stage?.color)}
          >
            {lead.stage?.name || 'No stage'}
          </span>
        );

      case 'last_remark':
        return (
          <div className="text-sm font-semibold text-gray-600 max-w-[200px] truncate" title={lead.lastRemark || 'No Remarks'}>
            {lead.lastRemark || '—'}
          </div>
        );

      case 'total_amount':
        return (
          <div className="text-sm font-black text-gray-900">
            {formatCurrency((lead as any).totalAmount || 0)}
          </div>
        );

      case 'advance_amount':
        return (
          <div className="text-sm font-black text-gray-900">
            {formatCurrency(lead.advanceAmount || 0)}
          </div>
        );

      case 'lead_lifecycle':
        return (
          <div className="text-sm font-semibold text-gray-600">
            {lead.lifecycle?.name || 'No lifecycle'}
          </div>
        );

      case 'source':
        return (
          <div className="text-sm font-semibold text-gray-600">
            {lead.source?.name || 'Unknown'}
          </div>
        );

      case 'office':
        return (
          <div className="text-sm font-semibold text-gray-600">
            {lead.office?.name || '—'}
          </div>
        );

      case 'created_at':
        return (
          <div>
            <div className="text-sm font-black text-gray-900">{format(new Date(lead.createdAt), 'dd MMM yyyy')}</div>
            <div className="text-xs font-semibold text-gray-400">{format(new Date(lead.createdAt), 'hh:mm a')}</div>
          </div>
        );

      case 'updated_at':
        return (
          <div>
            <div className="text-sm font-black text-gray-900">{lead.updatedAt ? format(new Date(lead.updatedAt), 'dd MMM yyyy') : '—'}</div>
            <div className="text-xs font-semibold text-gray-400">{lead.updatedAt ? format(new Date(lead.updatedAt), 'hh:mm a') : ''}</div>
          </div>
        );

      case 'status':
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
              lead.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {lead.status || 'ACTIVE'}
          </span>
        );

      default:
        // Custom Dynamic Field
        if (col.key.startsWith('custom_field:')) {
          const fieldId = col.fieldId || col.key.replace('custom_field:', '');
          const dynamicValues = (lead as any).dynamicValues as Array<any> | undefined;
          const entry = dynamicValues?.find((dv) => dv.fieldId === fieldId || dv.field?.id === fieldId);

          if (!entry || entry.value === undefined || entry.value === null || entry.value === '') {
            return <span className="text-sm font-semibold text-gray-300">—</span>;
          }

          let val = entry.value;
          if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
            try {
              const parsed = JSON.parse(val);
              if (Array.isArray(parsed)) {
                val = parsed.join(', ');
              }
            } catch (e) {
              // keep raw string
            }
          }

          return (
            <div className="text-sm font-semibold text-gray-700 max-w-[200px] truncate" title={String(val)}>
              {String(val)}
            </div>
          );
        }

        return <span className="text-sm font-semibold text-gray-300">—</span>;
    }
  };

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

              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 ${
                    col.isSortable ? 'cursor-pointer hover:text-emerald-500 transition-colors select-none' : ''
                  }`}
                  onClick={() => {
                    if (col.key === 'total_amount') {
                      setSortAmountDirection((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
                      setSortAdvanceAmountDirection(null);
                      setSortRemarkDirection(null);
                    } else if (col.key === 'advance_amount') {
                      setSortAdvanceAmountDirection((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
                      setSortAmountDirection(null);
                      setSortRemarkDirection(null);
                    } else if (col.key === 'last_remark') {
                      setSortRemarkDirection((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
                      setSortAmountDirection(null);
                      setSortAdvanceAmountDirection(null);
                    }
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.isSortable && (
                      <span className="text-[10px] opacity-70">
                        {col.key === 'total_amount' ? (sortAmountDirection === 'asc' ? '↑' : sortAmountDirection === 'desc' ? '↓' : '↕') : ''}
                        {col.key === 'advance_amount' ? (sortAdvanceAmountDirection === 'asc' ? '↑' : sortAdvanceAmountDirection === 'desc' ? '↓' : '↕') : ''}
                        {col.key === 'last_remark' ? (sortRemarkDirection === 'asc' ? '↑' : sortRemarkDirection === 'desc' ? '↓' : '↕') : ''}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              <th className="px-6 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400 text-right">
                Actions
              </th>
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
                  {Array.from({ length: activeColumns.length + 1 }).map((__, cellIndex) => (
                    <td key={`cell-${cellIndex}`} className="px-6 py-5">
                      <div className="h-5 rounded-xl shimmer-bg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={totalColsCount} className="px-6 py-20 text-center">
                  <div className="mx-auto max-w-sm">
                    <h3 className="text-lg font-black text-gray-900">Unable to load leads.</h3>
                    <p className="mt-2 text-sm font-semibold text-gray-500">
                      Please refresh the page or try again in a moment.
                    </p>
                  </div>
                </td>
              </tr>
            ) : sortedItems.length === 0 ? (
              <tr>
                <td colSpan={totalColsCount} className="px-6 py-20 text-center">
                  <div className="mx-auto max-w-sm">
                    <h3 className="text-lg font-black text-gray-900">No leads match the current filters</h3>
                    <p className="mt-2 text-sm font-semibold text-gray-500">
                      Adjust the stage, owner, or source filters, or create a new lead from the header action.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedItems.map((lead, index) => {
                const isSelected = safeSelectedIds.includes(lead.id);
                return (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onView(lead)}
                    className={`group cursor-pointer transition-colors hover:bg-emerald-50/35 ${
                      isSelectionMode && isSelected ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    {isSelectionMode && (
                      <motion.td initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelection(lead.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500 transition-all cursor-pointer shadow-sm hover:scale-110"
                          aria-label={`Select ${lead.name}`}
                        />
                      </motion.td>
                    )}

                    {activeColumns.map((col) => (
                      <td key={col.key} className="px-6 py-5">
                        {renderCellContent(lead, col)}
                      </td>
                    ))}

                    <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {lead.deletedAt ? (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-gray-500">
                            Archived
                          </span>
                        ) : (
                          <>
                            <WhatsAppActionButton
                              phone={lead.phone}
                              lead={lead}
                              source="Lead List"
                              variant="table"
                              stopPropagation
                              requiredPermissions={LEAD_WHATSAPP_PERMISSIONS}
                              audit={{
                                entityType: 'Lead',
                                entityId: lead.id,
                                entityName: lead.name,
                              }}
                            />
                            <CallButton
                              leadId={lead.id}
                              leadName={lead.name}
                              phone={lead.phone}
                              sourceContext="ALL_LEADS"
                              currentStageName={lead.stage?.name}
                              size="md"
                              variant="icon"
                              onInitiate={callTracking.startCall}
                            />
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
                              onClick={() => onHistory(lead)}
                              className="rounded-2xl bg-indigo-50 p-2 text-indigo-600 transition-all hover:bg-indigo-100"
                              aria-label={`History for ${lead.name}`}
                            >
                              <History className="h-4 w-4" />
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
            Showing <span className="text-gray-900">{rangeStart}-{rangeEnd}</span> of{' '}
            <span className="text-gray-900">{total}</span>
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

      {callTracking.isModalOpen && callTracking.activeSession && (
        <CallOutcomeModal
          isOpen={callTracking.isModalOpen}
          onClose={callTracking.closeModal}
          callSessionId={callTracking.activeSession.callSessionId}
          leadId={callTracking.activeSession.leadId}
          leadName={callTracking.activeSession.leadName}
          leadPhone={callTracking.activeSession.leadPhone}
          sourceContext={callTracking.activeSession.sourceContext as any}
          currentStageName={callTracking.activeSession.currentStageName}
          currentSubstageName={callTracking.activeSession.currentSubstageName}
        />
      )}
    </div>
  );
};

export default memo(LeadsTable);
