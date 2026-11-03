import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTimeline, SummaryFilters } from '../../../../services/summaryReports.api';
import { Activity } from 'lucide-react';
import { format } from 'date-fns';

interface ActivityTimelineSectionProps {
  filters: SummaryFilters;
}

const ActivityTimelineSection: React.FC<ActivityTimelineSectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-timeline', filters],
    queryFn: () => fetchTimeline(filters),
  });

  if (isLoading) return <div className="h-32 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80">
            <Activity size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Activity Timeline Stream</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {data.data.length} {data.data.length === 1 ? 'Event' : 'Events'}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 p-3.5 sm:p-4">
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-gray-200 before:to-transparent">
          {data.data.map((item: any) => (
            <div key={item.id} className="relative flex items-start gap-3 pl-1">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-emerald-500 text-white shadow-2xs shrink-0 z-10 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="flex-1 rounded-lg bg-gray-50/80 p-2.5 border border-gray-100">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-xs">{item.activityType.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{format(new Date(item.createdAt), 'hh:mm a')}</span>
                </div>
                {item.lead && (
                  <div className="text-xs text-gray-600 space-y-0.5">
                    <p><span className="text-gray-400">Lead:</span> <strong className="text-gray-800">{item.lead.name}</strong></p>
                    {item.lead.source && <p><span className="text-gray-400">Source:</span> {item.lead.source.name}</p>}
                  </div>
                )}
                {item.createdBy && (
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium">Logged by {item.createdBy.name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimelineSection;
