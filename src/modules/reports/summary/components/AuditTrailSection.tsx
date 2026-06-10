import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditSummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { List } from 'lucide-react';
import { format } from 'date-fns';

interface AuditTrailSectionProps {
  filters: SummaryFilters;
}

const AuditTrailSection: React.FC<AuditTrailSectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-audit', filters],
    queryFn: () => fetchAuditSummary(filters),
  });

  if (isLoading) return <div className="h-40 bg-gray-100 animate-pulse rounded-2xl mt-6"></div>;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <List className="text-gray-500" size={20} /> Audit Trail
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((audit: any) => (
                <tr key={audit.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{audit.lead?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600">
                      {audit.activityType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">{audit.createdBy?.name || '-'}</td>
                  <td className="px-6 py-4">{format(new Date(audit.createdAt), 'dd MMM yyyy, hh:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailSection;
