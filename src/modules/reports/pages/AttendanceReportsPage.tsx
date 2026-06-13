import React, { useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ReportPageShell from '../shared/ReportPageShell';
import ReportFiltersBar from '../shared/ReportFiltersBar';
import ReportPagination from '../shared/ReportPagination';
import { createDefaultReportFilters } from '../shared/reportFilterDefaults';
import { buildApiFilters, useReportUsers } from '../shared/useReportUsers';
import AttendanceActivitySection from '../summary/components/AttendanceActivitySection';
import TargetActivitySection from '../summary/components/TargetActivitySection';
import { downloadCsv } from '../shared/exportUtils';
import { fetchAttendanceSummary } from '../../../services/summaryReports.api';

const AttendanceReportsPage: React.FC = () => {
  const [filters, setFilters] = useState(createDefaultReportFilters());
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  const attendanceQuery = useQuery({
    queryKey: ['report-attendance-export', apiFilters],
    queryFn: () => fetchAttendanceSummary(apiFilters),
  });

  const handleExport = () => {
    const rows = (attendanceQuery.data?.data || []).map((item: any) => [
      item.user?.name || '-',
      item.status || '-',
      item.checkInTime || '-',
      item.checkOutTime || '-',
      item.date || '-',
    ]);
    downloadCsv(`attendance-report-${Date.now()}.csv`, ['User', 'Status', 'Check In', 'Check Out', 'Date'], rows);
  };

  return (
    <ReportPageShell
      title="Attendance Reports"
      description="Attendance check-in/out records and target activity for the selected users and period."
      icon={<CalendarCheck className="text-emerald-500" size={28} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
      onExportCsv={handleExport}
    >
      <AttendanceActivitySection filters={apiFilters} />
      <TargetActivitySection filters={apiFilters} />
      <ReportPagination
        page={filters.page || 1}
        totalPages={attendanceQuery.data?.pagination?.totalPages}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      />
    </ReportPageShell>
  );
};

export default AttendanceReportsPage;
