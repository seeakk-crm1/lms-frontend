import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { LOBAuditItem } from './types/lobAnalysis.types';

interface LOBAuditTableProps {
  data: LOBAuditItem[];
  loading?: boolean;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

const LOBAuditTable: React.FC<LOBAuditTableProps> = ({ data, loading, page, totalPages, total, onPageChange }) => (
  <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
    <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-500">Audit Trail</p>
        <h2 className="mt-1 text-2xl font-black text-gray-900">LOB Movement Log</h2>
      </div>
      <div className="rounded-2xl bg-gray-50 px-4 py-2 text-sm font-black text-gray-500">{total} records</div>
    </div>

    <div className="overflow-hidden rounded-[24px] border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse text-left">
          <thead className="bg-gray-50/90">
            <tr className="border-b border-gray-100">
              {['Lead', 'Previous Stage', 'Reason', 'Changed By', 'Comment', 'Date & Time'].map((heading) => (
                <th key={heading} className="px-5 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {Array.from({ length: 6 }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-5 py-4">
                      <div className="h-5 rounded-xl bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length ? (
              data.map((row) => (
                <tr key={`${row.lead_id}-${row.created_at}`} className="transition-colors hover:bg-emerald-50/35">
                  <td className="px-5 py-4">
                    <div className="text-sm font-black text-gray-900">{row.lead_name}</div>
                    <div className="mt-1 text-xs font-semibold text-gray-400">{row.lead_id}</div>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-700">{row.from_stage}</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-700">{row.reason}</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-700">{row.changed_by}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-500">{row.comment || 'No remarks'}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-black text-gray-900">{format(new Date(row.created_at), 'dd MMM yyyy')}</div>
                    <div className="mt-1 text-xs font-semibold text-gray-400">{format(new Date(row.created_at), 'hh:mm a')}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <p className="text-lg font-black text-gray-900">No LOB audit records found</p>
                  <p className="mt-2 text-sm font-semibold text-gray-500">Adjust the filters or wait for new LOB movements to appear.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="rounded-2xl bg-gray-50 px-4 py-2 text-sm font-black text-gray-600">
        Page {page} of {Math.max(1, totalPages)}
      </div>
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
  </section>
);

export default LOBAuditTable;
