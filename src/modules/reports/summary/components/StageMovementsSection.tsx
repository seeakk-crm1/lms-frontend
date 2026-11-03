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

  if (isLoading) return <div className="h-32 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/80">
            <ArrowRightLeft size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Lead Stage Movements</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {data.data.length} {data.data.length === 1 ? 'Movement' : 'Movements'}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50/90 font-bold border-b border-gray-200/80 tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Lead Name</th>
                <th className="px-3.5 py-2.5">Stage Transition</th>
                <th className="px-3.5 py-2.5">Changed By</th>
                <th className="px-3.5 py-2.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((movement: any) => (
                <tr key={movement.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3.5 py-2.5 font-bold text-gray-900">{movement.lead?.name || '-'}</td>
                  <td className="px-3.5 py-2.5">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
                        {movement.fromStage?.name || 'Initial'}
                      </span>
                      <ArrowRightLeft size={11} className="text-gray-400" />
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {movement.toStage?.name || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-gray-600">{movement.createdBy?.name || '-'}</td>
                  <td className="px-3.5 py-2.5 text-right text-gray-500 font-medium">
                    {format(new Date(movement.createdAt), 'dd MMM yyyy, hh:mm a')}
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

export default StageMovementsSection;
