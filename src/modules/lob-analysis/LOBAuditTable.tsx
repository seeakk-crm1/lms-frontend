import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import type { LOBAuditItem } from './types/lobAnalysis.types';

interface LOBAuditTableProps {
  data: LOBAuditItem[];
  loading?: boolean;
  page: number;
  totalPages: number;
  total: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onPageChange: (page: number) => void;
}

const LOBAuditTable: React.FC<LOBAuditTableProps> = ({
  data,
  loading,
  page,
  totalPages,
  total,
  emptyTitle = 'No LOB audit records found',
  emptyDescription = 'Adjust the filters or wait for new LOB movements to appear.',
  onPageChange,
}) => (
  <section className="rounded-xl border border-gray-200/80 bg-white shadow-2xs overflow-hidden">
    <div className="px-3.5 py-3 border-b border-gray-100 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80">
          <ClipboardList size={15} />
        </div>
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-gray-900">LOB Movement Log</h2>
          <p className="text-[11px] text-gray-500">Comprehensive audit trail of stage transitions into LOB</p>
        </div>
      </div>
      <div className="text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200/70 rounded-md px-2.5 py-1 self-start sm:self-auto">
        <span className="font-bold text-gray-900">{total.toLocaleString()}</span> records
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-[880px] w-full border-collapse text-left">
        <thead className="bg-gray-50/80 border-b border-gray-100">
          <tr>
            <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Lead</th>
            <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Previous Stage</th>
            <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Reason</th>
            <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Changed By</th>
            <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Remarks / Comment</th>
            <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">Date & Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                {Array.from({ length: 6 }).map((__, cellIndex) => (
                  <td key={cellIndex} className="px-3.5 py-3">
                    <div className="h-4 rounded bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length ? (
            data.map((row) => (
              <tr key={`${row.lead_id}-${row.created_at}`} className="transition-colors hover:bg-emerald-50/30">
                <td className="px-3.5 py-2.5">
                  <div className="text-xs font-bold text-gray-900">{row.lead_name}</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">{row.lead_id}</div>
                </td>
                <td className="px-3.5 py-2.5">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700 border border-gray-200/60">
                    {row.from_stage}
                  </span>
                </td>
                <td className="px-3.5 py-2.5">
                  <span className="text-xs font-semibold text-gray-800">{row.reason}</span>
                </td>
                <td className="px-3.5 py-2.5">
                  <span className="text-xs font-medium text-gray-700">{row.changed_by}</span>
                </td>
                <td className="px-3.5 py-2.5">
                  <span
                    className={`text-xs ${
                      row.comment ? 'text-gray-600' : 'italic text-gray-400'
                    } line-clamp-1`}
                    title={row.comment || undefined}
                  >
                    {row.comment || 'No remarks'}
                  </span>
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <div className="text-xs font-semibold text-gray-900">
                    {format(new Date(row.created_at), 'dd MMM yyyy')}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {format(new Date(row.created_at), 'hh:mm a')}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center">
                <p className="text-xs sm:text-sm font-bold text-gray-800">{emptyTitle}</p>
                <p className="mt-1 text-xs text-gray-500">{emptyDescription}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="px-3.5 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
      <span className="text-xs text-gray-500">
        Showing page <span className="font-semibold text-gray-800">{page}</span> of{' '}
        <span className="font-semibold text-gray-800">{Math.max(1, totalPages)}</span>
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-2xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-2xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);

export default LOBAuditTable;
