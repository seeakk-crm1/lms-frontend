import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquareQuote } from 'lucide-react';
import { format } from 'date-fns';
import { fetchFollowupsLatestNotesReport, SummaryFilters } from '../../../../services/summaryReports.api';

interface FollowupLatestNotesSectionProps {
  filters: SummaryFilters;
}

const FollowupLatestNotesSection: React.FC<FollowupLatestNotesSectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-followups-latest-notes', filters],
    queryFn: () => fetchFollowupsLatestNotesReport(filters),
  });

  if (isLoading) return <div className="h-20 animate-pulse rounded-xl bg-gray-100/80 border border-gray-200/80" />;
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-2.5 print:break-inside-avoid">
      <div className="flex items-center gap-2 pb-1.5 border-b border-gray-200/80">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100/80">
          <MessageSquareQuote size={13} />
        </div>
        <h3 className="text-xs sm:text-sm font-bold text-gray-900">Recent Followup Notes</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {data.map((item) => (
          <div key={item.leadId} className="rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-gray-900 truncate">Lead: {item.leadName}</p>
              <span className="text-[10px] text-gray-400 font-medium shrink-0">
                {format(new Date(item.latestNoteAt), 'dd MMM, hh:mm a')}
              </span>
            </div>
            <p className="text-[11px] font-medium text-gray-500">Updated by {item.addedBy}</p>
            <p className="rounded-lg bg-gray-50/80 p-2 text-xs text-gray-700 border border-gray-100 whitespace-pre-wrap leading-relaxed">
              {item.latestNote}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowupLatestNotesSection;
