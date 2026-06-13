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

  if (isLoading) return <div className="mt-8 h-40 animate-pulse rounded-2xl bg-gray-100" />;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8 print:break-before-page">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
        <PhoneCall className="text-purple-500" size={20} /> Followup Activity
      </h2>
      <div className="space-y-6">
        {(data.data as FollowupDetailReportItem[]).map((followup) => (
          <FollowupDetailCard key={followup.id} followup={followup} />
        ))}
      </div>
    </div>
  );
};

export default FollowupActivitySection;
