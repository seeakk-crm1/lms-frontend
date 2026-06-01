import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal, PencilLine, Power, Trash2 } from 'lucide-react';
import type { ExtensionReason } from '../types/followUpExtensionReason.types';

interface ExtensionReasonTableProps {
  rows: ExtensionReason[];
  loading?: boolean;
  canManage: boolean;
  onEdit: (item: ExtensionReason) => void;
  onToggleStatus: (item: ExtensionReason) => void;
  onDelete: (item: ExtensionReason) => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const RowActions: React.FC<{
  row: ExtensionReason;
  canManage: boolean;
  onEdit: (item: ExtensionReason) => void;
  onToggleStatus: (item: ExtensionReason) => void;
  onDelete: (item: ExtensionReason) => void;
}> = ({ row, canManage, onEdit, onToggleStatus, onDelete }) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  const items = useMemo(
    () => [
      { label: 'Edit', icon: PencilLine, onClick: () => onEdit(row), show: canManage, destructive: false },
      { label: row.isActive ? 'Deactivate' : 'Activate', icon: Power, onClick: () => onToggleStatus(row), show: canManage, destructive: row.isActive },
      { label: 'Delete', icon: Trash2, onClick: () => onDelete(row), show: canManage, destructive: true },
    ].filter((item) => item.show),
    [canManage, onEdit, onToggleStatus, onDelete, row],
  );

  if (!items.length) return null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-2xl border border-gray-200 p-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        aria-label={`Open actions for ${row.reasonName}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-12 z-20 min-w-[180px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)]"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-colors ${
                  item.destructive ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const TableSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
    ))}
  </div>
);

const ExtensionReasonTable: React.FC<ExtensionReasonTableProps> = ({ rows, loading, canManage, onEdit, onToggleStatus, onDelete }) => {
  if (loading) {
    return <TableSkeleton />;
  }

  if (!rows.length) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 px-6 text-center">
        <div className="text-xl font-black text-gray-900">No extension reasons found</div>
        <p className="mt-2 max-w-md text-sm font-semibold text-gray-500">
          Add follow-up snooze/remind-later reasons to standardize why follow-up activities are rescheduled.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full border-separate border-spacing-y-3">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="text-left text-[11px] font-black uppercase tracking-[0.22em] text-gray-400">
              <th className="px-4 py-3">Reason Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Sort Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <motion.tr key={row.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="group">
                <td className="rounded-l-3xl border-y border-l border-gray-100 bg-white px-4 py-4 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  <div className="font-black text-gray-900">{row.reasonName}</div>
                </td>
                <td className="border-y border-gray-100 bg-white px-4 py-4 text-sm font-semibold text-gray-500 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  {row.description || '—'}
                </td>
                <td className="border-y border-gray-100 bg-white px-4 py-4 text-sm font-bold text-gray-700 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  {row.sortOrder}
                </td>
                <td className="border-y border-gray-100 bg-white px-4 py-4 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  <StatusBadge isActive={row.isActive} />
                </td>
                <td className="border-y border-gray-100 bg-white px-4 py-4 text-sm font-bold text-gray-600 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  {formatDate(row.createdAt)}
                </td>
                <td className="rounded-r-3xl border-y border-r border-gray-100 bg-white px-4 py-4 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  <RowActions row={row} canManage={canManage} onEdit={onEdit} onToggleStatus={onToggleStatus} onDelete={onDelete} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {rows.map((row) => (
          <motion.div key={row.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-black text-gray-900">{row.reasonName}</div>
                <div className="mt-1 text-sm text-gray-500">{row.description || '—'}</div>
                <div className="mt-3 flex gap-2">
                  <StatusBadge isActive={row.isActive} />
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600">Sort: {row.sortOrder}</span>
                </div>
              </div>
              <div className="self-end sm:self-start">
                <RowActions row={row} canManage={canManage} onEdit={onEdit} onToggleStatus={onToggleStatus} onDelete={onDelete} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 text-sm font-semibold text-gray-500 sm:grid-cols-2">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Created Date</div>
                <div className="mt-1 text-gray-700">{formatDate(row.createdAt)}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default memo(ExtensionReasonTable);
