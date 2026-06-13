import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { fetchFollowupsDetailReport, SummaryFilters } from '../../../../services/summaryReports.api';
import type { FollowupDetailReportItem } from '../../shared/followupReport.types';

interface FollowupExtensionsSectionProps {
  filters: SummaryFilters;
}

const FollowupExtensionsSection: React.FC<FollowupExtensionsSectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-followups-detail', filters],
    queryFn: () => fetchFollowupsDetailReport(filters),
  });

  if (isLoading) return <div className="mt-8 h-40 animate-pulse rounded-2xl bg-gray-100" />;
  const items = ((data?.data || []) as FollowupDetailReportItem[]).filter((item) => item.extensions.length > 0);
  if (items.length === 0) return null;

  return (
    <div className="mt-8 print:break-before-page">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
        <CalendarClock className="text-rose-500" size={20} /> Followup Extension History
      </h2>
      <div className="space-y-6">
        {items.map((followup) => (
          <div key={followup.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm print:break-inside-avoid">
            <p className="text-sm font-black text-gray-900">{followup.leadName}</p>
            <p className="text-xs text-gray-500">Assigned User: {followup.assignedUser}</p>
            <div className="mt-4 space-y-4">
              {followup.extensions.map((ext, index) => (
                <div key={`${followup.id}-extension-${index}`} className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-sm text-gray-800">
                  <p><strong>Original Date:</strong> {ext.originalDate}</p>
                  <p><strong>Extended To:</strong> {ext.extendedTo}</p>
                  <p><strong>Extension Reason:</strong> {ext.reason || 'Not specified'}</p>
                  <p><strong>Extended By:</strong> {ext.extendedBy}</p>
                  <p><strong>Extension Time:</strong> {format(new Date(ext.extendedAt), 'dd/MM/yyyy hh:mm a')}</p>
                  <p className="mt-2 whitespace-pre-wrap"><strong>Description:</strong> {ext.description || 'No description provided.'}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowupExtensionsSection;
