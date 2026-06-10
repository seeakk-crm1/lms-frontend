import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStageMovementsSummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';

interface StageMovementsSectionProps {
  filters: SummaryFilters;
}

const StageMovementsSection: React.FC<StageMovementsSectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-stage-movements', filters],
    queryFn: () => fetchStageMovementsSummary(filters),
  });

  if (isLoading) return <div className="h-40 bg-gray-100 animate-pulse rounded-2xl mt-6"></div>;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <ArrowRightLeft className="text-indigo-500" size={20} /> Lead Stage Movements
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Transition</th>
                <th className="px-6 py-4">Changed By</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((movement: any) => (
                <tr key={movement.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{movement.lead?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600">{movement.fromStage?.name || 'New'}</span>
                      <ArrowRightLeft size={14} className="text-gray-400" />
                      <span className="px-2 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600">{movement.toStage?.name || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{movement.createdBy?.name || '-'}</td>
                  <td className="px-6 py-4">{format(new Date(movement.createdAt), 'dd MMM yyyy, hh:mm a')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StageMovementsSection;
