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

  if (isLoading) return <div className="mt-6 h-24 animate-pulse rounded-2xl bg-gray-100" />;
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-6 print:break-inside-avoid">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-gray-900">
        <MessageSquareQuote className="text-emerald-500" size={16} /> Important Followup Notes
      </h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.leadId} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-sm font-black text-gray-900">Lead: {item.leadName}</p>
            <p className="mt-1 text-xs text-gray-500">
              Latest update by {item.addedBy} · {format(new Date(item.latestNoteAt), 'dd/MM/yyyy hh:mm a')}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              <strong>Latest Note:</strong> {item.latestNote}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowupLatestNotesSection;
