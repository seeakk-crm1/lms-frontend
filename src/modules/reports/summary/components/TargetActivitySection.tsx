import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTargetsSummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { Target } from 'lucide-react';
import { format } from 'date-fns';

interface TargetActivitySectionProps {
  filters: SummaryFilters;
}

const TargetActivitySection: React.FC<TargetActivitySectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-targets', filters],
    queryFn: () => fetchTargetsSummary(filters),
  });

  if (isLoading) return <div className="h-40 bg-gray-100 animate-pulse rounded-2xl mt-6"></div>;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <Target className="text-red-500" size={20} /> Target Activity
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Target Cycle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((target: any) => (
                <tr key={target.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{target.user?.name || '-'}</td>
                  <td className="px-6 py-4">{target.targetCycle?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${target.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {target.isActive ? 'Active' : 'Locked'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{format(new Date(target.updatedAt), 'dd MMM yyyy, hh:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TargetActivitySection;
