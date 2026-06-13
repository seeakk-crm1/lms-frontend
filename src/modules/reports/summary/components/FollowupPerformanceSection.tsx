import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { fetchFollowupsPerformanceReport, SummaryFilters } from '../../../../services/summaryReports.api';

interface FollowupPerformanceSectionProps {
  filters: SummaryFilters;
}

const FollowupPerformanceSection: React.FC<FollowupPerformanceSectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-followups-performance', filters],
    queryFn: () => fetchFollowupsPerformanceReport(filters),
  });

  if (isLoading) return <div className="mt-4 h-24 animate-pulse rounded-2xl bg-gray-100" />;
  if (!data || data.length === 0) return null;

  const targetUserId = typeof filters.userId === 'string' ? filters.userId : undefined;
  const rows = targetUserId ? data.filter((item) => item.userId === targetUserId) : data;
  if (rows.length === 0) return null;

  return (
    <div className="mt-4 print:break-inside-avoid">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-gray-900">
        <BarChart3 className="text-purple-500" size={16} /> Followup Performance
      </h3>
      <div className="space-y-4">
        {rows.map((item) => (
          <div key={item.userId} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-black text-gray-900">{item.userName}</p>
            <ul className="mt-2 ml-5 list-disc space-y-1">
              <li>Assigned Followups: {item.assignedFollowups}</li>
              <li>Completed Followups: {item.completedFollowups}</li>
              <li>Extended Followups: {item.extendedFollowups}</li>
              <li>Missed Followups: {item.missedFollowups}</li>
              <li>Overdue Followups: {item.overdueFollowups}</li>
              <li>Completion Rate: {item.completionRate}%</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowupPerformanceSection;
