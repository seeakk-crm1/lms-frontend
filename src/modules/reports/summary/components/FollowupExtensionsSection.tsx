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

  if (isLoading) return <div className="h-32 animate-pulse rounded-xl bg-gray-100/80 border border-gray-200/80" />;
  const items = ((data?.data || []) as FollowupDetailReportItem[]).filter((item) => item.extensions.length > 0);
  if (items.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5 print:break-before-page">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100/80">
            <CalendarClock size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Followup Extension History</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {items.length} {items.length === 1 ? 'Lead' : 'Leads'}
        </span>
      </div>

      <div className="space-y-3">
        {items.map((followup) => (
          <div key={followup.id} className="rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs print:break-inside-avoid space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <p className="text-xs sm:text-sm font-bold text-gray-900">{followup.leadName}</p>
              <p className="text-[11px] font-medium text-gray-500">Assigned: {followup.assignedUser}</p>
            </div>

            <div className="space-y-2">
              {followup.extensions.map((ext, index) => (
                <div key={`${followup.id}-extension-${index}`} className="rounded-lg border border-rose-100/80 bg-rose-50/40 p-2.5 text-xs text-gray-800 space-y-1">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-rose-900">
                    <span>{ext.originalDate} → {ext.extendedTo}</span>
                    <span className="text-[10px] text-gray-500 font-normal">
                      By {ext.extendedBy} on {format(new Date(ext.extendedAt), 'dd MMM yyyy, hh:mm a')}
                    </span>
                  </div>
                  {ext.reason && <p className="text-[11px] text-gray-700"><strong>Reason:</strong> {ext.reason}</p>}
                  {ext.description && <p className="text-[11px] text-gray-600 whitespace-pre-wrap">{ext.description}</p>}
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
