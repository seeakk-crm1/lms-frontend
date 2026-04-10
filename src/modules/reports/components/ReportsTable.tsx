import React from 'react';
import { motion } from 'framer-motion';
import type { SavedReport } from '../types/report.types';
import ReportRowActions from './ReportRowActions';

interface ReportsTableProps {
  reports: SavedReport[];
  loading?: boolean;
  onGenerate: (report: SavedReport) => void;
  onDownload: (report: SavedReport) => void;
  onEdit: (report: SavedReport) => void;
  onDelete: (report: SavedReport) => void;
  generatingId?: string | null;
  downloadingId?: string | null;
  deletingId?: string | null;
  canManage: boolean;
}

const Pill: React.FC<{ tone: 'green' | 'orange' | 'gray'; children: React.ReactNode }> = ({ tone, children }) => {
  const toneClass =
    tone === 'green'
      ? 'bg-emerald-50 text-emerald-700'
      : tone === 'orange'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-gray-100 text-gray-600';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${toneClass}`}>{children}</span>;
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '-');
const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : '-');

const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  loading,
  onGenerate,
  onDownload,
  onEdit,
  onDelete,
  generatingId,
  downloadingId,
  deletingId,
  canManage,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-20 animate-pulse rounded-3xl border border-gray-100 bg-white" />
        ))}
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-gray-200 bg-white/80 px-8 py-14 text-center">
        <p className="text-xl font-black text-gray-900">No reports found</p>
        <p className="mt-2 text-sm font-semibold text-gray-500">
          Try adjusting your filters, or create a new report instance to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[28px] border border-gray-100 bg-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] lg:block">
        <div className="max-h-[65vh] overflow-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur">
              <tr className="text-left text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                {['Report Name', 'Report Type', 'Report Date', 'Is Active', 'Generated', 'Created Date', 'Created By', 'Actions'].map((label) => (
                  <th key={label} className="px-6 py-4">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-100 text-sm font-semibold text-gray-700 hover:bg-emerald-50/40"
                >
                  <td className="px-6 py-5">
                    <div className="font-black text-gray-900">{report.reportName}</div>
                    <div className="mt-1 text-xs font-semibold text-gray-400">{report.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-5">{report.reportType?.name || '-'}</td>
                  <td className="px-6 py-5">{formatDate(report.reportDate)}</td>
                  <td className="px-6 py-5">
                    <Pill tone={report.isActive ? 'green' : 'gray'}>{report.isActive ? 'Active' : 'Inactive'}</Pill>
                  </td>
                  <td className="px-6 py-5">
                    <Pill tone={report.isGenerated ? 'green' : 'orange'}>{report.isGenerated ? 'Completed' : 'Pending'}</Pill>
                  </td>
                  <td className="px-6 py-5">{formatDateTime(report.createdAt)}</td>
                  <td className="px-6 py-5">{report.createdBy?.displayName || report.createdBy?.name || '-'}</td>
                  <td className="px-6 py-5">
                    <ReportRowActions
                      report={report}
                      onGenerate={onGenerate}
                      onDownload={onDownload}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      generatingId={generatingId}
                      downloadingId={downloadingId}
                      deletingId={deletingId}
                      canManage={canManage}
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:hidden">
        {reports.map((report) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-gray-900">{report.reportName}</h3>
                <p className="mt-1 text-sm font-semibold text-gray-500">{report.reportType?.name || '-'}</p>
              </div>
              <ReportRowActions
                report={report}
                onGenerate={onGenerate}
                onDownload={onDownload}
                onEdit={onEdit}
                onDelete={onDelete}
                generatingId={generatingId}
                downloadingId={downloadingId}
                deletingId={deletingId}
                canManage={canManage}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold text-gray-600">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Report Date</p>
                <p className="mt-1">{formatDate(report.reportDate)}</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Created</p>
                <p className="mt-1">{formatDateTime(report.createdAt)}</p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Active</p>
                <div className="mt-1">
                  <Pill tone={report.isActive ? 'green' : 'gray'}>{report.isActive ? 'Active' : 'Inactive'}</Pill>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-400">Generated</p>
                <div className="mt-1">
                  <Pill tone={report.isGenerated ? 'green' : 'orange'}>{report.isGenerated ? 'Completed' : 'Pending'}</Pill>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default ReportsTable;
