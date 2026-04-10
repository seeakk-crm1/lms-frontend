import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { LeadLifeCycle } from '../../../types/admin/lead-life-cycle/leadLifeCycle.types';

interface Props {
  items: LeadLifeCycle[];
  isLoading: boolean;
  search: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onPageChange: (value: number) => void;
  onEdit: (item: LeadLifeCycle) => void;
  onDelete: (item: LeadLifeCycle) => void;
  onCreate: () => void;
}

const EmptyIllustration: React.FC = () => (
  <svg viewBox="0 0 240 140" className="mx-auto h-28 w-48 text-emerald-500/70" fill="none" aria-hidden="true">
    <rect x="12" y="30" width="216" height="92" rx="14" className="fill-emerald-50 stroke-emerald-100" />
    <rect x="30" y="48" width="80" height="12" rx="6" className="fill-emerald-200" />
    <rect x="30" y="68" width="60" height="9" rx="4" className="fill-emerald-100" />
    <rect x="132" y="48" width="78" height="8" rx="4" className="fill-emerald-200" />
    <circle cx="156" cy="86" r="14" className="fill-white stroke-emerald-200" />
    <path d="M156 80v12M150 86h12" className="stroke-emerald-500" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const LeadLifeCycleTable: React.FC<Props> = ({
  items,
  isLoading,
  search,
  page,
  limit,
  total,
  totalPages,
  onSearchChange,
  onPageChange,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, idx) => idx + 1), [totalPages]);
  const safeFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const safeTo = Math.min(total, page * limit);

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50/40 p-4 md:p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search lead life cycles..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            aria-label="Search lead life cycles"
          />
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="bg-gray-50/60">
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Cycle Title</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Is Default</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Created Date</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Modified Date</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Created By</th>
              <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-widest text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                  {Array.from({ length: 6 }).map((__, colIndex) => (
                    <td key={`skeleton-col-${rowIndex}-${colIndex}`} className="px-5 py-4">
                      <div className="h-4 w-24 rounded shimmer-bg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <EmptyIllustration />
                  <p className="mt-2 text-sm font-black text-gray-800">No life cycles created yet</p>
                  <p className="mt-1 text-xs text-gray-500">Create your first lifecycle to define lead progression.</p>
                  <button
                    onClick={onCreate}
                    className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4" />
                    Create Life Cycle
                  </button>
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="transition-colors hover:bg-emerald-50/40"
                >
                  <td className="px-5 py-4 text-sm font-black text-gray-900">{item.name}</td>
                  <td className="px-5 py-4">
                    {item.isDefault ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                        Default
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-gray-500">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-500">
                    {format(new Date(item.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-500">
                    {format(new Date(item.updatedAt), 'dd MMM yyyy')}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-700">{item.createdBy || 'System'}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors hover:bg-blue-100"
                        title="Edit life cycle"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                        title="Delete life cycle"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-gray-50 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="space-y-3 p-4 animate-pulse">
              <div className="h-4 w-2/3 rounded shimmer-bg" />
              <div className="h-3 w-1/3 rounded shimmer-bg" />
              <div className="h-9 w-full rounded shimmer-bg" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <EmptyIllustration />
            <p className="mt-2 text-sm font-black text-gray-800">No life cycles created yet</p>
            <button
              onClick={onCreate}
              className="mx-auto mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-white"
            >
              <Plus className="h-4 w-4" />
              Create Life Cycle
            </button>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="space-y-3 p-4 transition-colors hover:bg-emerald-50/30">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-gray-900">{item.name}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-gray-500">Created By: {item.createdBy || 'System'}</p>
                </div>
                {item.isDefault ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black uppercase text-emerald-700">
                    Default
                  </span>
                ) : null}
              </div>

              <p className="text-[11px] font-semibold text-gray-500">
                Created: {format(new Date(item.createdAt), 'dd MMM yyyy')} | Modified:{' '}
                {format(new Date(item.updatedAt), 'dd MMM yyyy')}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="rounded-xl bg-blue-50 py-2 text-xs font-black text-blue-600 hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="rounded-xl bg-red-50 py-2 text-xs font-black text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-50 bg-gray-50/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-[11px] font-bold text-gray-500">
          Showing {safeFrom}-{safeTo} of {total} cycles
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {pages.map((entry) => (
            <button
              key={entry}
              onClick={() => onPageChange(entry)}
              className={`h-8 w-8 rounded-lg text-xs font-black ${
                entry === page
                  ? 'bg-emerald-500 text-white'
                  : 'border border-gray-100 bg-white text-gray-500 hover:text-gray-900'
              }`}
            >
              {entry}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(LeadLifeCycleTable);
