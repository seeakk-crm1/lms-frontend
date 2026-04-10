import React from 'react';
import { Download, Pencil, Play, Trash2 } from 'lucide-react';
import type { SavedReport } from '../types/report.types';

interface ReportRowActionsProps {
  report: SavedReport;
  onGenerate: (report: SavedReport) => void;
  onDownload: (report: SavedReport) => void;
  onEdit: (report: SavedReport) => void;
  onDelete: (report: SavedReport) => void;
  generatingId?: string | null;
  downloadingId?: string | null;
  deletingId?: string | null;
  canManage: boolean;
}

const actionButtonClass =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50';

const ReportRowActions: React.FC<ReportRowActionsProps> = ({
  report,
  onGenerate,
  onDownload,
  onEdit,
  onDelete,
  generatingId,
  downloadingId,
  deletingId,
  canManage,
}) => {
  const isGenerating = generatingId === report.id;
  const isDownloading = downloadingId === report.id;
  const isDeleting = deletingId === report.id;

  return (
    <div className="flex items-center justify-end gap-2">
      {report.isGenerated ? (
        <button
          type="button"
          className={actionButtonClass}
          onClick={() => onDownload(report)}
          disabled={isDownloading}
          aria-label={`Download ${report.reportName}`}
          title="Download report"
        >
          <Download size={16} />
        </button>
      ) : (
        <button
          type="button"
          className={actionButtonClass}
          onClick={() => onGenerate(report)}
          disabled={isGenerating}
          aria-label={`Generate ${report.reportName}`}
          title="Generate report"
        >
          <Play size={16} />
        </button>
      )}

      {canManage && (
        <>
          <button
            type="button"
            className={actionButtonClass}
            onClick={() => onEdit(report)}
            aria-label={`Edit ${report.reportName}`}
            title="Edit report"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className={actionButtonClass}
            onClick={() => onDelete(report)}
            disabled={isDeleting}
            aria-label={`Delete ${report.reportName}`}
            title="Delete report"
          >
            <Trash2 size={16} />
          </button>
        </>
      )}
    </div>
  );
};

export default ReportRowActions;
