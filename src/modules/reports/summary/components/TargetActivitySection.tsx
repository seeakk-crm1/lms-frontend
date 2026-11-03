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

  if (isLoading) return <div className="h-32 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-100/80">
            <Target size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Target Activity</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {data.data.length} {data.data.length === 1 ? 'Target' : 'Targets'}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50/90 font-bold border-b border-gray-200/80 tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">User</th>
                <th className="px-3.5 py-2.5">Target Cycle</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((target: any) => (
                <tr key={target.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3.5 py-2.5 font-bold text-gray-900">{target.user?.name || '-'}</td>
                  <td className="px-3.5 py-2.5 text-gray-600">{target.targetCycle?.name || '-'}</td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        target.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {target.isActive ? 'Active' : 'Locked'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-gray-500">
                    {format(new Date(target.updatedAt), 'dd MMM yyyy, hh:mm a')}
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

export default TargetActivitySection;
