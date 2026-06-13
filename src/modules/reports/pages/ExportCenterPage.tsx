import React from 'react';
import { Link } from 'react-router-dom';
import { Download, FileBarChart2, FileSpreadsheet, Printer } from 'lucide-react';
import ReportPageShell from '../shared/ReportPageShell';
import ReportsTable from '../components/ReportsTable';
import { useDownloadReportMutation, useGenerateReportMutation, useReportsQuery } from '../hooks/useReports';
import useReportStore from '../store/reportStore';
import { printReport } from '../shared/exportUtils';

const ExportCenterPage: React.FC = () => {
  const { page, limit, setPage } = useReportStore();
  const reportsQuery = useReportsQuery();
  const generateMutation = useGenerateReportMutation();
  const downloadMutation = useDownloadReportMutation();

  const reports = reportsQuery.data?.data || [];
  const pagination = reportsQuery.data?.pagination;

  return (
    <ReportPageShell
      title="Export Center"
      description="Generate and download reports instantly. No report type setup required for activity and summary modules."
      icon={<Download className="text-emerald-500" size={28} />}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: 'Activity Reports', path: '/reports/activity', description: 'Full activity timeline and sections' },
          { title: 'Summary Reports', path: '/reports/summary', description: 'Management-readable summaries' },
          { title: 'Revenue Reports', path: '/reports/revenue', description: 'Revenue entries and exports' },
          { title: 'Lead Reports', path: '/reports/leads', description: 'Lead creation and stage movement' },
          { title: 'Followup Reports', path: '/reports/followups', description: 'Follow-up and extension history' },
          { title: 'Attendance Reports', path: '/reports/attendance', description: 'Attendance and target activity' },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
          >
            <div className="mb-2 flex items-center gap-2 font-black text-gray-900">
              <FileBarChart2 size={18} className="text-emerald-500" />
              {item.title}
            </div>
            <p className="text-sm text-gray-500">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={printReport} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700">
            <Printer size={16} /> Print Current Page
          </button>
          <button type="button" onClick={printReport} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700">
            <FileSpreadsheet size={16} /> Export From Module Pages
          </button>
        </div>

        <h3 className="text-lg font-black text-gray-900">Previously Generated Exports</h3>
        <p className="mb-4 text-sm text-gray-500">Download CSV exports that were already generated in the system.</p>

        <ReportsTable
          reports={reports}
          loading={reportsQuery.isLoading}
          onGenerate={(report) => generateMutation.mutate(report.id)}
          onDownload={(report) => downloadMutation.mutate(report.id)}
          onEdit={() => undefined}
          onDelete={() => undefined}
          generatingId={generateMutation.isPending ? reports[0]?.id || null : null}
          downloadingId={downloadMutation.isPending ? reports[0]?.id || null : null}
          canManage={false}
        />

        {pagination ? (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Page {page} of {pagination.totalPages || 1}</p>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1 text-xs font-bold disabled:opacity-40">Previous</button>
              <button type="button" disabled={page >= (pagination.totalPages || 1)} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1 text-xs font-bold disabled:opacity-40">Next</button>
            </div>
          </div>
        ) : null}
      </div>
    </ReportPageShell>
  );
};

export default ExportCenterPage;
