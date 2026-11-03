import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRevenueSummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';
import { format } from 'date-fns';

interface RevenueActivitySectionProps {
  filters: SummaryFilters;
}

const RevenueActivitySection: React.FC<RevenueActivitySectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-revenue', filters],
    queryFn: () => fetchRevenueSummary(filters),
  });

  if (isLoading) return <div className="h-32 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100/80">
            <IndianRupee size={15} />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900">Revenue Activity</h3>
        </div>
        <span className="text-[11px] font-semibold text-gray-500">
          {data.data.length} {data.data.length === 1 ? 'Entry' : 'Entries'}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50/90 font-bold border-b border-gray-200/80 tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Lead Name</th>
                <th className="px-3.5 py-2.5">Amount</th>
                <th className="px-3.5 py-2.5">Recorded By</th>
                <th className="px-3.5 py-2.5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.data.map((rev: any) => (
                <tr key={rev.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3.5 py-2.5 font-bold text-gray-900">{rev.lead?.name || '-'}</td>
                  <td className="px-3.5 py-2.5 font-bold text-emerald-700">{formatCurrency(rev.amount)}</td>
                  <td className="px-3.5 py-2.5 text-gray-600">{rev.createdBy?.name || '-'}</td>
                  <td className="px-3.5 py-2.5 text-right text-gray-500">
                    {format(new Date(rev.createdAt), 'dd MMM yyyy')}
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

export default RevenueActivitySection;
