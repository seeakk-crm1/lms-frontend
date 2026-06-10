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

  if (isLoading) return <div className="h-40 bg-gray-100 animate-pulse rounded-2xl mt-6"></div>;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <CheckSquare className="text-teal-500" size={20} /> Approval Activity
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Requested By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Approved By</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((approval: any) => (
                <tr key={approval.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{approval.lead?.name || '-'}</td>
                  <td className="px-6 py-4">{approval.requestedBy?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600">
                      {approval.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{approval.approvedBy?.name || '-'}</td>
                  <td className="px-6 py-4">{format(new Date(approval.createdAt), 'dd MMM yyyy, hh:mm a')}</td>
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
