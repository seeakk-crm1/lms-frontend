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

  if (isLoading) return <div className="mt-8 h-40 animate-pulse rounded-2xl bg-gray-100" />;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8 print:break-before-page">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
        <History className="text-indigo-500" size={20} /> Followup History Timeline
      </h2>
      <div className="space-y-6">
        {(data.data as FollowupDetailReportItem[]).map((followup) => (
          <div key={followup.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm print:break-inside-avoid">
            <p className="text-sm font-black text-gray-900">{followup.leadName}</p>
            <p className="text-xs text-gray-500">{followup.followupType} · {followup.status}</p>
            <div className="mt-4 space-y-3">
              {followup.timeline.map((entry, index) => (
                <div key={`${followup.id}-history-${index}`} className="border-l-2 border-indigo-200 pl-4">
                  <p className="text-xs font-bold text-gray-400">{entry.time}</p>
                  <p className="text-sm font-black text-gray-900">{entry.event}</p>
                  {entry.detail ? <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">"{entry.detail}"</p> : null}
                  {entry.reason ? <p className="mt-1 text-sm text-gray-600"><strong>Reason:</strong> {entry.reason}</p> : null}
                  {index < followup.timeline.length - 1 ? <hr className="my-3 border-gray-100" /> : null}
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
