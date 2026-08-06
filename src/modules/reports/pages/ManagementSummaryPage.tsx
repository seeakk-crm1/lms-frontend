import React, { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
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

const ManagementSummaryPage: React.FC = () => {
  const [filters, setFilters] = useState(createDefaultReportFilters());
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  const content = useMemo(() => {
    if (!apiFilters.userId) {
      return (
        <div className="space-y-8">
          <CompanyReportView filters={apiFilters} />
          <CallPerformanceSummarySection filters={apiFilters} />
          <FollowupPerformanceSection filters={apiFilters} />
          <FollowupLatestNotesSection filters={apiFilters} />
          <FollowupActivitySection filters={apiFilters} />
          <FollowupExtensionsSection filters={apiFilters} />
          <FollowupHistoryTimelineSection filters={apiFilters} />
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-gray-900">All Users Summary</h3>
            <p className="mt-2 text-sm text-gray-500">
              Select one or more users above to generate readable management summaries for each person.
            </p>
          </div>
        </div>
      );
    }

    const userIds = Array.isArray(apiFilters.userId) ? apiFilters.userId : [apiFilters.userId];
    return (
      <div className="space-y-10">
        {userIds.map((userId) => {
          const user = users.find((item: any) => item.id === userId);
          const userFilters = { ...apiFilters, userId };
          return (
            <div key={userId} className="space-y-8 print:break-before-page">
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
      icon={<FileText className="text-emerald-500" size={28} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
    >
      {content}
    </ReportPageShell>
  );
};

export default ManagementSummaryPage;
