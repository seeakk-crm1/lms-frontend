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

  if (isLoading) return <div className="h-20 animate-pulse rounded-xl bg-gray-100/80 border border-gray-200/80" />;
  if (!data || data.length === 0) return null;

  const targetUserId = typeof filters.userId === 'string' ? filters.userId : undefined;
  const rows = targetUserId ? data.filter((item) => item.userId === targetUserId) : data;
  if (rows.length === 0) return null;

  return (
    <div className="space-y-2.5 print:break-inside-avoid">
      <div className="flex items-center gap-2 pb-1.5 border-b border-gray-200/80">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-50 text-purple-600 border border-purple-100/80">
          <BarChart3 size={13} />
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-gray-900">Followup Performance Metrics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {rows.map((item) => (
          <div key={item.userId} className="rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-900 truncate">{item.userName}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                {item.completionRate}% Completed
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-center">
              <div className="rounded-md bg-gray-50/80 p-1.5 border border-gray-100">
                <p className="text-[9px] font-bold text-gray-400 uppercase">Assigned</p>
                <p className="text-xs font-black text-gray-800 leading-tight mt-0.5">{item.assignedFollowups}</p>
              </div>
              <div className="rounded-md bg-emerald-50/60 p-1.5 border border-emerald-100/80">
                <p className="text-[9px] font-bold text-emerald-600 uppercase">Completed</p>
                <p className="text-xs font-black text-emerald-700 leading-tight mt-0.5">{item.completedFollowups}</p>
              </div>
              <div className="rounded-md bg-amber-50/60 p-1.5 border border-amber-100/80">
                <p className="text-[9px] font-bold text-amber-600 uppercase">Extended</p>
                <p className="text-xs font-black text-amber-700 leading-tight mt-0.5">{item.extendedFollowups}</p>
              </div>
              <div className="rounded-md bg-rose-50/60 p-1.5 border border-rose-100/80">
                <p className="text-[9px] font-bold text-rose-600 uppercase">Missed</p>
                <p className="text-xs font-black text-rose-700 leading-tight mt-0.5">{item.missedFollowups}</p>
              </div>
              <div className="rounded-md bg-red-50/60 p-1.5 border border-red-100/80 col-span-3 sm:col-span-1">
                <p className="text-[9px] font-bold text-red-600 uppercase">Overdue</p>
                <p className="text-xs font-black text-red-700 leading-tight mt-0.5">{item.overdueFollowups}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowupPerformanceSection;
