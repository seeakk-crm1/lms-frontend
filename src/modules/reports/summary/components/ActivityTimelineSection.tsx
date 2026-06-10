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

  if (isLoading) return <div className="h-40 bg-gray-100 animate-pulse rounded-2xl mt-6"></div>;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="text-emerald-500" size={20} /> Activity Timeline
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          {data.data.map((item: any, idx: number) => (
            <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-100 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Activity size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 text-sm">{item.activityType.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-gray-400 font-bold">{format(new Date(item.createdAt), 'hh:mm a')}</span>
                </div>
                {item.lead && (
                  <div className="text-sm text-gray-600">
                    <p><strong>Lead:</strong> {item.lead.name}</p>
                    {item.lead.source && <p><strong>Source:</strong> {item.lead.source.name}</p>}
                  </div>
                )}
                {item.createdBy && (
                  <p className="text-xs text-gray-400 mt-2 font-medium">By {item.createdBy.name}</p>
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
