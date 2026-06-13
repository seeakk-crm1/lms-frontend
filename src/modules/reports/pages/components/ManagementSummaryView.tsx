import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { User as UserIcon } from 'lucide-react';
import {
  fetchAttendanceSummary,
  fetchLeadsSummary,
  fetchOverviewCard,
  SummaryFilters,
} from '../../../../services/summaryReports.api';
import FollowupLatestNotesSection from '../../summary/components/FollowupLatestNotesSection';
import FollowupPerformanceSection from '../../summary/components/FollowupPerformanceSection';

interface ManagementSummaryViewProps {
  filters: SummaryFilters;
  userName: string;
}

const ManagementSummaryView: React.FC<ManagementSummaryViewProps> = ({ filters, userName }) => {
  const overviewQuery = useQuery({ queryKey: ['mgmt-overview', filters], queryFn: () => fetchOverviewCard(filters) });
  const leadsQuery = useQuery({ queryKey: ['mgmt-leads', filters], queryFn: () => fetchLeadsSummary(filters) });
  const attendanceQuery = useQuery({ queryKey: ['mgmt-attendance', filters], queryFn: () => fetchAttendanceSummary(filters) });

  if (overviewQuery.isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />;
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

  const insight =
    overview?.aiInsight ||
    `${userName} created ${overview?.leadsCreated || 0} leads and generated ₹${(overview?.revenueGenerated || 0).toLocaleString()} revenue during the selected period.`;

  return (
    <div className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm print:shadow-none">
      <div className="flex items-center gap-3 border-b-2 border-emerald-500 pb-3">
        <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
          <UserIcon size={22} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">User Performance Summary</h2>
          <p className="text-sm font-semibold text-gray-500">User: {userName}</p>
        </div>
      </div>

      <div className="space-y-3 text-sm leading-7 text-gray-700">
        <p>
          <strong>{userName}</strong> created <strong>{overview?.leadsCreated || 0}</strong> leads during the selected period.
        </p>

        <div>
          <p className="font-bold text-gray-900">Lead Sources</p>
          <ul className="ml-5 list-disc">
            {Object.entries(sourceBreakdown).map(([name, count]) => (
              <li key={name}>{name}: {count}</li>
            ))}
            {Object.keys(sourceBreakdown).length === 0 ? <li>No leads in this period.</li> : null}
          </ul>
        </div>

        <div>
          <p className="font-bold text-gray-900">Lead Stage Progress</p>
          <ul className="ml-5 list-disc">
            {Object.entries(stageBreakdown).map(([name, count]) => (
              <li key={name}>{name}: {count}</li>
            ))}
            {Object.keys(stageBreakdown).length === 0 ? <li>No stage movement data.</li> : null}
          </ul>
        </div>

        <FollowupPerformanceSection filters={filters} />
        <FollowupLatestNotesSection filters={filters} />

        <p><strong>Revenue Generated:</strong> ₹{(overview?.revenueGenerated || 0).toLocaleString()}</p>
        <p><strong>Attendance:</strong> {attendance?.status || 'Not recorded'}</p>
        {attendance?.checkInTime ? (
          <p>
            <strong>Working Hours:</strong>{' '}
            {attendance.checkInTime ? format(new Date(attendance.checkInTime), 'hh:mm a') : '-'}
            {attendance.checkOutTime ? ` to ${format(new Date(attendance.checkOutTime), 'hh:mm a')}` : ''}
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-700">Management Insight</p>
        <p className="mt-2 text-sm font-semibold leading-7 text-indigo-900">"{insight}"</p>
      </div>
    </div>
  );
};

export default ManagementSummaryView;
