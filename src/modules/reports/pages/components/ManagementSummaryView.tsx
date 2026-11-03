import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatAttendanceTime } from '../../../../utils/attendanceTimezone';
import { User as UserIcon, Coins, Users, CalendarCheck, Clock } from 'lucide-react';
import {
  fetchAttendanceSummary,
  fetchLeadsSummary,
  fetchOverviewCard,
  SummaryFilters,
} from '../../../../services/summaryReports.api';
import FollowupLatestNotesSection from '../../summary/components/FollowupLatestNotesSection';
import FollowupPerformanceSection from '../../summary/components/FollowupPerformanceSection';
import { formatCurrency } from '../../../../utils/currency';

interface ManagementSummaryViewProps {
  filters: SummaryFilters;
  userName: string;
}

const ManagementSummaryView: React.FC<ManagementSummaryViewProps> = ({ filters, userName }) => {
  const overviewQuery = useQuery({ queryKey: ['mgmt-overview', filters], queryFn: () => fetchOverviewCard(filters) });
  const leadsQuery = useQuery({ queryKey: ['mgmt-leads', filters], queryFn: () => fetchLeadsSummary(filters) });
  const attendanceQuery = useQuery({ queryKey: ['mgmt-attendance', filters], queryFn: () => fetchAttendanceSummary(filters) });

  if (overviewQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100/80 border border-gray-200/80" />;
  }

  const overview = overviewQuery.data;
  const leads = Array.isArray(leadsQuery.data?.data) ? leadsQuery.data.data : [];
  const attendance = Array.isArray(attendanceQuery.data?.data) ? attendanceQuery.data.data[0] : undefined;

  const sourceBreakdown = leads.reduce((acc: Record<string, number>, lead: any) => {
    const key = lead.source?.name || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const stageBreakdown = leads.reduce((acc: Record<string, number>, lead: any) => {
    const key = lead.stage?.name || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-3.5 rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs print:shadow-none">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200/80">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80">
          <UserIcon size={15} />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">User Performance Profile</h3>
          <p className="text-[11px] font-medium text-gray-500">Representative: {userName}</p>
        </div>
      </div>

      {/* Mini KPI metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="h-[68px] rounded-lg border border-gray-200/80 bg-gray-50/50 p-2.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/80 shrink-0">
            <Users size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate">Leads Created</p>
            <p className="text-base font-black text-gray-900 leading-none mt-0.5">{overview?.leadsCreated || 0}</p>
          </div>
        </div>

        <div className="h-[68px] rounded-lg border border-gray-200/80 bg-gray-50/50 p-2.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/80 shrink-0">
            <Coins size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate">Revenue Generated</p>
            <p className="text-base font-black text-indigo-700 leading-none mt-0.5">{formatCurrency(overview?.revenueGenerated || 0)}</p>
          </div>
        </div>

        <div className="h-[68px] rounded-lg border border-gray-200/80 bg-gray-50/50 p-2.5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-50 text-teal-600 border border-teal-100/80 shrink-0">
            <CalendarCheck size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate">Attendance</p>
            <p className="text-xs font-bold text-gray-900 leading-none mt-0.5 truncate">{attendance?.status || 'Not recorded'}</p>
          </div>
        </div>
      </div>

      {/* Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-2">Lead Sources</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(sourceBreakdown).map(([name, count]) => (
              <span key={name} className="inline-flex items-center gap-1 rounded-md border border-gray-200/80 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 shadow-2xs">
                <span>{name}:</span>
                <span className="font-bold text-emerald-700">{String(count)}</span>
              </span>
            ))}
            {Object.keys(sourceBreakdown).length === 0 && (
              <span className="text-xs text-gray-400 italic">No leads in this period.</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-2">Stage Distribution</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(stageBreakdown).map(([name, count]) => (
              <span key={name} className="inline-flex items-center gap-1 rounded-md border border-gray-200/80 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 shadow-2xs">
                <span>{name}:</span>
                <span className="font-bold text-indigo-700">{String(count)}</span>
              </span>
            ))}
            {Object.keys(stageBreakdown).length === 0 && (
              <span className="text-xs text-gray-400 italic">No stage movements.</span>
            )}
          </div>
        </div>
      </div>

      {attendance?.checkInTime && (
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200/60">
          <Clock size={12} className="text-gray-400" />
          <span>Working Hours:</span>
          <span className="font-semibold text-gray-800">
            {formatAttendanceTime(attendance.checkInTime)}
            {attendance.checkOutTime ? ` to ${formatAttendanceTime(attendance.checkOutTime)}` : ''}
          </span>
        </div>
      )}

      <FollowupPerformanceSection filters={filters} />
      <FollowupLatestNotesSection filters={filters} />
    </div>
  );
};

export default ManagementSummaryView;
