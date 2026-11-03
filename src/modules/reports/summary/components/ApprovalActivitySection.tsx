import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApprovalsSummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ApprovalActivitySectionProps {
  filters: SummaryFilters;
}

const ApprovalActivitySection: React.FC<ApprovalActivitySectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-approvals', filters],
    queryFn: () => fetchApprovalsSummary(filters),
  });

  if (isLoading) return <div className="h-32 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100/80">
            <CheckSquare size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Approval Activity</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {data.data.length} {data.data.length === 1 ? 'Approval' : 'Approvals'}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50/90 font-bold border-b border-gray-200/80 tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Lead Name</th>
                <th className="px-3.5 py-2.5">Requested By</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5">Approved By</th>
                <th className="px-3.5 py-2.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((approval: any) => (
                <tr key={approval.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3.5 py-2.5 font-bold text-gray-900">{approval.lead?.name || '-'}</td>
                  <td className="px-3.5 py-2.5 text-gray-600">{approval.requestedBy?.name || '-'}</td>
                  <td className="px-3.5 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {approval.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-gray-600">{approval.approvedBy?.name || '-'}</td>
                  <td className="px-3.5 py-2.5 text-right text-gray-500 font-medium">
                    {format(new Date(approval.createdAt), 'dd MMM yyyy, hh:mm a')}
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

export default ApprovalActivitySection;
