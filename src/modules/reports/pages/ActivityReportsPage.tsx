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
        <div className="space-y-4">
          {apiFilters.userId.map((userId) => {
            const user = users.find((item: any) => item.id === userId);
            return (
              <div key={userId} className="rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs print:border-none print:p-0 print:shadow-none">
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
      icon={<Activity className="text-emerald-600" size={20} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
    >
      {content}
    </ReportPageShell>
  );
};

export default ActivityReportsPage;
