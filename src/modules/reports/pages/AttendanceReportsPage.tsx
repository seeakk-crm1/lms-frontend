import React, { useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ReportPageShell from '../shared/ReportPageShell';
import ReportFiltersBar from '../shared/ReportFiltersBar';
import ReportPagination from '../shared/ReportPagination';
import { createDefaultReportFilters } from '../shared/reportFilterDefaults';
import { buildApiFilters, useReportUsers } from '../shared/useReportUsers';
import AttendanceActivitySection from '../summary/components/AttendanceActivitySection';
import { downloadCsv } from '../shared/exportUtils';
import { fetchAttendanceSummary } from '../../../services/summaryReports.api';
import {
  formatAttendanceTime,
  formatAttendanceDate,
  resolveAttendanceCheckIn,
  resolveAttendanceCheckOut,
} from '../../../utils/attendanceTimezone';

const AttendanceReportsPage: React.FC = () => {
  const [filters, setFilters] = useState(createDefaultReportFilters());
  const { data: users = [] } = useReportUsers();
  const apiFilters = useMemo(() => buildApiFilters(filters, users), [filters, users]);

  const attendanceQuery = useQuery({
    queryKey: ['summary-attendance', apiFilters],
    queryFn: () => fetchAttendanceSummary(apiFilters),
  });

  const handleExport = () => {
    const rows = (attendanceQuery.data?.data || []).map((item: any) => [
      item.user?.name || '-',
      item.status || '-',
      formatAttendanceTime(resolveAttendanceCheckIn(item)),
      formatAttendanceTime(resolveAttendanceCheckOut(item)),
      formatAttendanceDate(item.date),
    ]);
    downloadCsv(`attendance-report-${Date.now()}.csv`, ['User', 'Status', 'Check In', 'Check Out', 'Date'], rows);
  };

  return (
    <ReportPageShell
      title="Attendance Reports"
      description="Attendance check-in/out records and status history for the selected users and period."
      icon={<CalendarCheck className="text-emerald-600" size={20} />}
      filters={<ReportFiltersBar filters={filters} setFilters={setFilters} />}
      onExportCsv={handleExport}
    >
      <div className="space-y-4">
        <AttendanceActivitySection filters={apiFilters} />
        <ReportPagination
          page={filters.page || 1}
          totalPages={attendanceQuery.data?.pagination?.totalPages}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      </div>
    </ReportPageShell>
  );
};

export default AttendanceReportsPage;
