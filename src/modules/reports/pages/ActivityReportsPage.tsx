import React, { useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import ReportPageShell from '../shared/ReportPageShell';
import ReportFiltersBar from '../shared/ReportFiltersBar';
import { createDefaultReportFilters } from '../shared/reportFilterDefaults';
import { buildApiFilters, useReportUsers } from '../shared/useReportUsers';
import UserReportView from '../summary/components/UserReportView';
import CompanyReportView from '../summary/components/CompanyReportView';

const ActivityReportsPage: React.FC = () => {
  const [filters, setFilters] = useState(createDefaultReportFilters());
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  const content = useMemo(() => {
    if (!apiFilters.userId) {
      return <CompanyReportView filters={apiFilters} />;
    }

    if (Array.isArray(apiFilters.userId)) {
      return (
        <div className="space-y-12">
          {apiFilters.userId.map((userId) => {
            const user = users.find((item: any) => item.id === userId);
            return (
              <div key={userId} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm print:border-none print:p-0 print:shadow-none">
                <UserReportView filters={{ ...apiFilters, userId }} userName={user?.name || 'Unknown User'} />
              </div>
            );
          })}
        </div>
      );
    }

    const user = users.find((item: any) => item.id === apiFilters.userId);
    return <UserReportView filters={apiFilters} userName={user?.name || 'Unknown User'} />;
  }, [apiFilters, users]);

  return (
    <ReportPageShell
      title="Activity Reports"
      description="Complete chronological activity with leads, follow-ups, revenue, attendance, targets, approvals, and timeline."
      icon={<Activity className="text-emerald-500" size={28} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
    >
      {content}
    </ReportPageShell>
  );
};

export default ActivityReportsPage;
