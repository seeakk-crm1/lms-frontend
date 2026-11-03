import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLeadsSummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { Users } from 'lucide-react';
import { format } from 'date-fns';

interface LeadsSectionProps {
  filters: SummaryFilters;
}

const LeadsSection: React.FC<LeadsSectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-leads', filters],
    queryFn: () => fetchLeadsSummary(filters),
  });

  if (isLoading) {
    return <div className="h-36 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;
  }
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100/80">
            <Users size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Lead Creation Summary</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {data.data.length} {data.data.length === 1 ? 'Lead' : 'Leads'}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50/90 font-bold border-b border-gray-200/80 tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Lead Name</th>
                <th className="px-3.5 py-2.5">Source</th>
                <th className="px-3.5 py-2.5">Stage</th>
                <th className="px-3.5 py-2.5">Assigned To</th>
                <th className="px-3.5 py-2.5 text-right">Created Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3.5 py-2.5 font-bold text-gray-900">{lead.name}</td>
                  <td className="px-3.5 py-2.5 text-gray-600">{lead.source?.name || '-'}</td>
                  <td className="px-3.5 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {lead.stage?.name || '-'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-gray-600">{lead.createdBy?.name || '-'}</td>
                  <td className="px-3.5 py-2.5 text-right text-gray-500 font-medium">
                    {format(new Date(lead.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadsSection;
