import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Pencil, Search, Trash2, User, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { LeadSource } from '../../../types/leadSource.types';

interface LeadSourceTableProps {
  items: LeadSource[];
  isLoading: boolean;
  canEdit: boolean;
  canDelete: boolean;
  search: string;
  status?: 'ACTIVE' | 'INACTIVE';
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value?: 'ACTIVE' | 'INACTIVE') => void;
  onPageChange: (page: number) => void;
  onEdit: (item: LeadSource) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (item: LeadSource) => void;
}

const LeadSourceTable: React.FC<LeadSourceTableProps> = ({
  items,
  isLoading,
  canEdit,
  canDelete,
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
  onToggleStatus,
  onDelete,
}) => {
  const pageButtons = useMemo(() => Array.from({ length: totalPages }, (_, index) => index + 1), [totalPages]);

  const safeFrom = total === 0 ? 0 : (page - 1) * limit + 1;
  const safeTo = Math.min(page * limit, total);

  const handleFilterAll = useCallback(() => onStatusChange(undefined), [onStatusChange]);
  const handleFilterActive = useCallback(() => onStatusChange('ACTIVE'), [onStatusChange]);
  const handleFilterInactive = useCallback(() => onStatusChange('INACTIVE'), [onStatusChange]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative group flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search lead sources..."
            aria-label="Search lead sources"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-50 rounded-xl focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm"
          />
        </div>
        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-50">
          <button
            onClick={handleFilterAll}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              status === undefined ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={handleFilterActive}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              status === 'ACTIVE' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={handleFilterInactive}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              status === 'INACTIVE' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Source Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Modified Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-4 w-40 rounded shimmer-bg" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 rounded shimmer-bg" /></td>
                  <td className="px-6 py-4"><div className="h-6 w-20 rounded-full shimmer-bg" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-28 rounded shimmer-bg" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-28 rounded shimmer-bg" /></td>
                  <td className="px-6 py-4"><div className="h-8 w-20 ml-auto rounded shimmer-bg" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-600 font-bold text-sm">No lead sources available</p>
                    <p className="text-gray-400 text-xs">Create your first lead source</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-black text-gray-900">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-gray-600 bg-gray-100 rounded-lg">
                      <User className="w-3 h-3" />
                      {item.createdBy || 'System'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 opacity-50" />
                      {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-gray-500">{format(new Date(item.updatedAt), 'MMM dd, yyyy p')}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {canEdit ? (
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      ) : null}
                      {canEdit ? (
                        <button
                          onClick={() => onToggleStatus(item.id)}
                          className={`px-3 py-2 rounded-xl text-[11px] font-black transition-all hover:shadow-md focus:outline-none focus:ring-2 ${
                            item.status === 'ACTIVE'
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 focus:ring-amber-500/30'
                              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:ring-emerald-500/30'
                          }`}
                          aria-label={`${item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} ${item.name}`}
                        >
                          {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button
                          onClick={() => onDelete(item)}
                          className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/30"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : null}
                      {!canEdit && !canDelete ? (
                        <span className="text-[11px] font-bold text-gray-400">View only</span>
                      ) : null}
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
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="p-5 space-y-3">
              <div className="h-4 w-2/3 rounded shimmer-bg" />
              <div className="h-3 w-1/3 rounded shimmer-bg" />
              <div className="h-9 w-full rounded-xl shimmer-bg" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="py-16 text-center px-6">
            <p className="text-gray-600 font-bold text-sm">No lead sources available</p>
            <p className="text-gray-400 text-xs mt-1">Create your first lead source</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-5 space-y-3 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-gray-900">{item.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">{item.createdBy || 'System'}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              {canEdit || canDelete ? (
                <div className={`grid gap-2 ${canEdit && canDelete ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {canEdit ? (
                    <button
                      onClick={() => onEdit(item)}
                      className="py-2 rounded-xl text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100"
                      aria-label={`Edit ${item.name}`}
                    >
                      Edit
                    </button>
                  ) : null}
                  {canEdit ? (
                    <button
                      onClick={() => onToggleStatus(item.id)}
                      className="py-2 rounded-xl text-xs font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                      aria-label={`${item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} ${item.name}`}
                    >
                      {item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  ) : null}
                  {canDelete ? (
                    <button
                      onClick={() => onDelete(item)}
                      className="py-2 rounded-xl text-xs font-black text-red-600 bg-red-50 hover:bg-red-100"
                      aria-label={`Delete ${item.name}`}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 px-3 py-2 text-center text-xs font-bold text-gray-400">
                  View only
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-gray-50/30 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
          Displaying <span className="text-gray-900 font-black">{safeFrom}-{safeTo}</span> of{' '}
          <span className="text-gray-900 font-black">{total}</span> Lead Sources
        </span>
        <div className="flex items-center gap-1">
          {pageButtons.map((value) => (
            <button
              key={value}
              onClick={() => onPageChange(value)}
              className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                value === page
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white border border-gray-100 text-gray-400 hover:text-gray-900'
              }`}
              aria-label={`Page ${value}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(LeadSourceTable);
