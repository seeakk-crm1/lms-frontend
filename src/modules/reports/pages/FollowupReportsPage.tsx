import React, { useMemo, useState } from 'react';
import { PhoneCall } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ReportPageShell from '../shared/ReportPageShell';
import ReportFiltersBar from '../shared/ReportFiltersBar';
import ReportPagination from '../shared/ReportPagination';
import { createDefaultReportFilters } from '../shared/reportFilterDefaults';
import { buildApiFilters, useReportUsers } from '../shared/useReportUsers';
import FollowupActivitySection from '../summary/components/FollowupActivitySection';
import FollowupExtensionsSection from '../summary/components/FollowupExtensionsSection';
import { downloadCsv } from '../shared/exportUtils';
import { fetchFollowupsSummary } from '../../../services/summaryReports.api';

const FollowupReportsPage: React.FC = () => {
  const [filters, setFilters] = useState(createDefaultReportFilters());
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  const followupsQuery = useQuery({
    queryKey: ['report-followups-export', apiFilters],
    queryFn: () => fetchFollowupsSummary(apiFilters),
  });

  const handleExport = () => {
    const rows = (followupsQuery.data?.data || []).map((item: any) => [
      item.lead?.name || '-',
      item.activityType || '-',
      item.createdBy?.name || '-',
      item.createdAt || '-',
    ]);
    downloadCsv(`followup-report-${Date.now()}.csv`, ['Lead', 'Type', 'User', 'Created'], rows);
  };

  return (
    <ReportPageShell
      title="Followup Reports"
      description="Every follow-up created, completed, extended, and extension history for the selected period."
      icon={<PhoneCall className="text-emerald-500" size={28} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
      onExportCsv={handleExport}
    >
      <FollowupActivitySection filters={apiFilters} />
      <FollowupExtensionsSection filters={apiFilters} />
      <ReportPagination
        page={filters.page || 1}
        totalPages={followupsQuery.data?.pagination?.totalPages}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </ReportPageShell>
  );
};

export default FollowupReportsPage;
