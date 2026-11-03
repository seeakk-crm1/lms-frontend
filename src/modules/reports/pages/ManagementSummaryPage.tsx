import React, { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import ReportPageShell from '../shared/ReportPageShell';
import ReportFiltersBar from '../shared/ReportFiltersBar';
import { createDefaultReportFilters } from '../shared/reportFilterDefaults';
import { buildApiFilters, useReportUsers } from '../shared/useReportUsers';
import CompanyReportView from '../summary/components/CompanyReportView';
import ManagementSummaryView from './components/ManagementSummaryView';
import FollowupActivitySection from '../summary/components/FollowupActivitySection';
import FollowupExtensionsSection from '../summary/components/FollowupExtensionsSection';
import FollowupHistoryTimelineSection from '../summary/components/FollowupHistoryTimelineSection';
import FollowupLatestNotesSection from '../summary/components/FollowupLatestNotesSection';
import FollowupPerformanceSection from '../summary/components/FollowupPerformanceSection';
import CallPerformanceSummarySection from '../summary/components/CallPerformanceSummarySection';
import { exportSummaryReport } from '../../../services/summaryReports.api';

const ManagementSummaryPage: React.FC = () => {
  const [filters, setFilters] = useState(createDefaultReportFilters());
  const [exportingInteractive, setExportingInteractive] = useState(false);
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  const handleExportInteractive = async () => {
    setExportingInteractive(true);
    try {
      const blobData = await exportSummaryReport(apiFilters);
      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'text/html' }));
      const link = document.createElement('a');
      link.href = url;
      const dateStr = apiFilters.startDate ? format(new Date(apiFilters.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      link.setAttribute('download', `Seeakk_Summary_Report_${dateStr}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Interactive export failed:', err);
    } finally {
      setExportingInteractive(false);
    }
  };

  const content = useMemo(() => {
    if (!apiFilters.userId) {
      return (
        <div className="space-y-3.5 sm:space-y-4">
          <CompanyReportView filters={apiFilters} />
          <CallPerformanceSummarySection filters={apiFilters} />
          <FollowupPerformanceSection filters={apiFilters} />
          <FollowupLatestNotesSection filters={apiFilters} />
          <FollowupActivitySection filters={apiFilters} />
          <FollowupExtensionsSection filters={apiFilters} />
          <FollowupHistoryTimelineSection filters={apiFilters} />
          <div className="rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">Multi-User Management View</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Select one or more users in the filters above to inspect personalized activity reports and timelines.
            </p>
          </div>
        </div>
      );
    }

    const userIds = Array.isArray(apiFilters.userId) ? apiFilters.userId : [apiFilters.userId];
    return (
      <div className="space-y-4">
        {userIds.map((userId) => {
          const user = users.find((item: any) => item.id === userId);
          const userFilters = { ...apiFilters, userId };
          return (
            <div key={userId} className="space-y-3.5 sm:space-y-4 rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs print:break-before-page">
              <ManagementSummaryView
                filters={userFilters}
                userName={user?.name || 'Unknown User'}
              />
              <FollowupActivitySection filters={userFilters} />
              <FollowupExtensionsSection filters={userFilters} />
              <FollowupHistoryTimelineSection filters={userFilters} />
            </div>
          );
        })}
      </div>
    );
  }, [apiFilters, users]);

  return (
    <ReportPageShell
      title="Summary Reports"
      description="Readable management summaries with performance insights for one user, multiple users, or company-wide rankings."
      icon={<FileText className="text-emerald-600" size={20} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
      onExportInteractive={handleExportInteractive}
      isExportingInteractive={exportingInteractive}
    >
      {content}
    </ReportPageShell>
  );
};

export default ManagementSummaryPage;
