import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History } from 'lucide-react';
import { fetchFollowupsDetailReport, SummaryFilters } from '../../../../services/summaryReports.api';
import type { FollowupDetailReportItem } from '../../shared/followupReport.types';

interface FollowupHistoryTimelineSectionProps {
  filters: SummaryFilters;
}

const FollowupHistoryTimelineSection: React.FC<FollowupHistoryTimelineSectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-followups-detail', filters],
    queryFn: () => fetchFollowupsDetailReport(filters),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-xl bg-gray-100/80 border border-gray-200/80" />;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5 print:break-before-page">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/80">
            <History size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Followup History Timeline</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {data.data.length} {data.data.length === 1 ? 'Lead' : 'Leads'}
        </span>
      </div>

      <div className="space-y-3">
        {(data.data as FollowupDetailReportItem[]).map((followup) => (
          <div key={followup.id} className="rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs print:break-inside-avoid space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <p className="text-xs sm:text-sm font-bold text-gray-900">{followup.leadName}</p>
              <p className="text-[11px] font-medium text-gray-500">{followup.followupType} · {followup.status}</p>
            </div>

            <div className="space-y-2.5 pl-1">
              {followup.timeline.map((entry, index) => (
                <div key={`${followup.id}-history-${index}`} className="border-l-2 border-indigo-200 pl-3 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">{entry.time}</span>
                    <p className="text-xs font-bold text-gray-900">{entry.event}</p>
                  </div>
                  {entry.detail && <p className="text-xs text-gray-700 whitespace-pre-wrap">{entry.detail}</p>}
                  {entry.reason && <p className="text-xs text-gray-600"><strong>Reason:</strong> {entry.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowupHistoryTimelineSection;
