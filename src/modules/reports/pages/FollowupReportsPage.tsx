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
import FollowupHistoryTimelineSection from '../summary/components/FollowupHistoryTimelineSection';
import { downloadCsv } from '../shared/exportUtils';
import { fetchFollowupsDetailReport } from '../../../services/summaryReports.api';
import type { FollowupDetailReportItem } from '../shared/followupReport.types';

const FollowupReportsPage: React.FC = () => {
  const [filters, setFilters] = useState(createDefaultReportFilters());
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  const followupsQuery = useQuery({
    queryKey: ['report-followups-export', apiFilters],
    queryFn: () => fetchFollowupsDetailReport(apiFilters),
  });

  const handleExport = () => {
    const rows: string[][] = [];
    ((followupsQuery.data?.data || []) as FollowupDetailReportItem[]).forEach((item) => {
      rows.push([item.leadName, item.followupType, item.assignedUser, item.status, item.scheduledDate, 'Details', '']);
      item.notes.forEach((note) => {
        rows.push([item.leadName, 'Note', note.addedBy, note.date, note.time, note.note, '']);
      });
      if (item.completion) {
        rows.push([item.leadName, 'Completion', item.completion.completedBy, item.completion.completedAt, '', item.completion.note, '']);
      }
      item.extensions.forEach((ext) => {
        rows.push([
          item.leadName,
          'Extension',
          ext.extendedBy,
          ext.originalDate,
          ext.extendedTo,
          ext.reason || '',
          ext.description,
        ]);
      });
      item.timeline.forEach((entry) => {
        rows.push([item.leadName, entry.event, entry.date, entry.time, entry.reason || '', entry.detail || '', '']);
      });
    });

    downloadCsv(
      `followup-report-${Date.now()}.csv`,
      ['Lead', 'Event Type', 'User/Date', 'Date/Time', 'Extra', 'Notes/Detail', 'Description'],
      rows,
    );
  };

  return (
    <ReportPageShell
      title="Followup Reports"
      description="Every follow-up with complete notes, completion notes, extension history, and timeline for the selected period."
      icon={<PhoneCall className="text-emerald-500" size={28} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
      onExportCsv={handleExport}
    >
      <FollowupActivitySection filters={apiFilters} />
      <FollowupExtensionsSection filters={apiFilters} />
      <FollowupHistoryTimelineSection filters={apiFilters} />
      <ReportPagination
        page={filters.page || 1}
        totalPages={followupsQuery.data?.pagination?.totalPages}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </ReportPageShell>
  );
};

export default FollowupReportsPage;
