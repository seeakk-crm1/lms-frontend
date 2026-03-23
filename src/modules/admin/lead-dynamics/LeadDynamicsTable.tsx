import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { LeadDynamicField } from './types';

interface Props {
  items: LeadDynamicField[];
  isLoading: boolean;
  search: string;
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: 'ALL' | 'ACTIVE' | 'INACTIVE') => void;
  onPageChange: (value: number) => void;
  onEdit: (item: LeadDynamicField) => void;
  onDelete: (item: LeadDynamicField) => void;
}

const LeadDynamicsTable: React.FC<Props> = ({
  items,
  isLoading,
  search,
  status,
  page,
  limit,
  total,
  totalPages,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  const pages = useMemo(() => Array.from({ length: totalPages }, (_, idx) => idx + 1), [totalPages]);
  const safeFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const safeTo = Math.min(page * limit, total);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 md:p-5 border-b border-gray-100 bg-gray-50/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by field name..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left">
          <thead>
            <tr className="bg-gray-50/60">
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Field Name</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Input Type</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Required</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Sort Order</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400">Created Date</th>
              <th className="px-5 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  {Array.from({ length: 7 }).map((__, col) => (
                    <td key={`col-${index}-${col}`} className="px-5 py-4">
                      <div className="h-4 w-24 rounded shimmer-bg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-black text-gray-700">No lead dynamic fields found</p>
                  <p className="text-xs text-gray-400 mt-1">Try changing search or filter criteria.</p>
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="hover:bg-gray-50/70 transition-colors"
                >
                  <td className="px-5 py-4 text-sm font-black text-gray-900">{item.name}</td>
                  <td className="px-5 py-4 text-xs font-bold text-gray-600">{item.inputType}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.isRequired ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.isRequired ? 'Mandatory' : 'Optional'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-gray-700">{item.sortOrder}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-gray-500">
                    {format(new Date(item.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit field"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-50">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="p-4 animate-pulse space-y-3">
              <div className="h-4 w-1/2 rounded shimmer-bg" />
              <div className="h-3 w-1/3 rounded shimmer-bg" />
              <div className="h-9 w-full rounded shimmer-bg" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="py-14 text-center px-6">
            <Search className="w-8 h-8 mx-auto text-gray-300" />
            <p className="text-sm font-black text-gray-700 mt-2">No lead dynamic fields found</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 space-y-3 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-black text-gray-900">{item.name}</p>
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    {item.inputType} | Sort: {item.sortOrder}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                    item.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <div className="text-[11px] font-semibold text-gray-500 space-y-1">
                <p>Required: {item.isRequired ? 'Mandatory' : 'Optional'}</p>
                <p>Created: {format(new Date(item.createdAt), 'dd MMM yyyy')}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="py-2 rounded-xl bg-red-50 text-red-600 text-xs font-black hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-[11px] font-bold text-gray-500">
          Showing {safeFrom}-{safeTo} of {total} fields
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {pages.map((entry) => (
            <button
              key={entry}
              onClick={() => onPageChange(entry)}
              className={`w-8 h-8 rounded-lg text-xs font-black ${
                entry === page
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border border-gray-100 text-gray-500 hover:text-gray-900'
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

export default React.memo(LeadDynamicsTable);
