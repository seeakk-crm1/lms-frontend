import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLeadUpdates, SummaryFilters } from '../../../../services/summaryReports.api';
import { Edit3 } from 'lucide-react';
import { format } from 'date-fns';

interface LeadUpdatesSectionProps {
  filters: SummaryFilters;
}

const LeadUpdatesSection: React.FC<LeadUpdatesSectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-lead-updates', filters],
    queryFn: () => fetchLeadUpdates(filters),
  });

  if (isLoading) return <div className="h-40 bg-gray-100 animate-pulse rounded-2xl mt-6"></div>;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <Edit3 className="text-amber-500" size={20} /> Lead Updates
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Updated By</th>
                <th className="px-6 py-4">Update Time</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((update: any) => (
                <tr key={update.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{update.lead?.name || '-'}</td>
                  <td className="px-6 py-4">{update.createdBy?.name || '-'}</td>
                  <td className="px-6 py-4">{format(new Date(update.createdAt), 'dd MMM yyyy, hh:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeadUpdatesSection;
