import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, PencilLine, Play, Power, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { ReportType } from '../types/reportType.types';

interface ReportTypeTableProps {
  rows: ReportType[];
  loading?: boolean;
  canManage: boolean;
  onEdit: (reportType: ReportType) => void;
  onToggleStatus: (reportType: ReportType) => void;
  onDelete: (reportType: ReportType) => void;
  onRun: (reportType: ReportType) => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const RowActions: React.FC<{
  row: ReportType;
  canManage: boolean;
  onEdit: (reportType: ReportType) => void;
  onToggleStatus: (reportType: ReportType) => void;
  onDelete: (reportType: ReportType) => void;
  onRun: (reportType: ReportType) => void;
}> = ({ row, canManage, onEdit, onToggleStatus, onDelete, onRun }) => {
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
      { label: 'Run Report', icon: Play, onClick: () => onRun(row), show: true },
      { label: 'Edit', icon: PencilLine, onClick: () => onEdit(row), show: canManage },
      {
        label: row.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
        icon: Power,
        onClick: () => onToggleStatus(row),
        show: canManage,
      },
      { label: 'Delete', icon: Trash2, onClick: () => onDelete(row), show: canManage, destructive: true },
    ].filter((item) => item.show),
    [canManage, onDelete, onEdit, onRun, onToggleStatus, row],
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-2xl border border-gray-200 p-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
        aria-label={`Open actions for ${row.name}`}
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

const ReportTypeTable: React.FC<ReportTypeTableProps> = ({ rows, loading, canManage, onEdit, onToggleStatus, onDelete, onRun }) => {
  if (loading) {
    return <TableSkeleton />;
  }

  if (!rows.length) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 px-6 text-center">
        <div className="text-xl font-black text-gray-900">No report types found</div>
        <p className="mt-2 max-w-md text-sm font-semibold text-gray-500">
          Try widening your search or filters, or add a new report type to start building reusable reporting templates.
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
              <th className="px-4 py-3">Report Name</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="group"
              >
                <td className="rounded-l-3xl border-y border-l border-gray-100 bg-white px-4 py-4 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  <div className="font-black text-gray-900">{row.name}</div>
                  <div className="mt-1 text-xs font-semibold text-gray-400">{row.baseDataSource}</div>
                </td>
                <td className="border-y border-gray-100 bg-white px-4 py-4 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600">{row.module}</span>
                </td>
                <td className="border-y border-gray-100 bg-white px-4 py-4 text-sm font-semibold text-gray-500 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  {row.description || 'No description added'}
                </td>
                <td className="border-y border-gray-100 bg-white px-4 py-4 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  <StatusBadge status={row.status} />
                </td>
                <td className="border-y border-gray-100 bg-white px-4 py-4 text-sm font-bold text-gray-600 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  {formatDate(row.createdAt)}
                </td>
                <td className="rounded-r-3xl border-y border-r border-gray-100 bg-white px-4 py-4 shadow-sm transition-colors group-hover:bg-emerald-50/30">
                  <RowActions row={row} canManage={canManage} onEdit={onEdit} onToggleStatus={onToggleStatus} onDelete={onDelete} onRun={onRun} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:hidden">
        {rows.map((row) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-black text-gray-900">{row.name}</div>
                <div className="mt-1 break-words text-sm font-semibold text-gray-400">{row.baseDataSource}</div>
              </div>
              <div className="self-end sm:self-start">
                <RowActions row={row} canManage={canManage} onEdit={onEdit} onToggleStatus={onToggleStatus} onDelete={onDelete} onRun={onRun} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600">{row.module}</span>
              <StatusBadge status={row.status} />
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-500">{row.description || 'No description added'}</p>
            <div className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-gray-400">Created {formatDate(row.createdAt)}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default memo(ReportTypeTable);
