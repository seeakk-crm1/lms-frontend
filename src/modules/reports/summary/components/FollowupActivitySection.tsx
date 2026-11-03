import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PhoneCall } from 'lucide-react';
import { fetchFollowupsDetailReport, SummaryFilters } from '../../../../services/summaryReports.api';
import FollowupDetailCard from './FollowupDetailCard';
import type { FollowupDetailReportItem } from '../../shared/followupReport.types';

interface FollowupActivitySectionProps {
  filters: SummaryFilters;
}

const FollowupActivitySection: React.FC<FollowupActivitySectionProps> = ({ filters }) => {
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
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100/80">
            <PhoneCall size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Followup Activity Records</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {data.data.length} {data.data.length === 1 ? 'Record' : 'Records'}
        </span>
      </div>

      <div className="space-y-3">
        {(data.data as FollowupDetailReportItem[]).map((followup) => (
          <FollowupDetailCard key={followup.id} followup={followup} />
        ))}
      </div>
    </div>
  );
};

export default FollowupActivitySection;
