import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRevenueSummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

interface RevenueActivitySectionProps {
  filters: SummaryFilters;
}

const RevenueActivitySection: React.FC<RevenueActivitySectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-revenue', filters],
    queryFn: () => fetchRevenueSummary(filters),
  });

  if (isLoading) return <div className="h-40 bg-gray-100 animate-pulse rounded-2xl mt-6"></div>;
  if (!data?.data || data.data.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <IndianRupee className="text-amber-500" size={20} /> Revenue Activity
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Recorded By</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((rev: any) => (
                <tr key={rev.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-900">{rev.lead?.name || '-'}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600">₹{rev.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">{rev.createdBy?.name || '-'}</td>
                  <td className="px-6 py-4">{format(new Date(rev.createdAt), 'dd MMM yyyy')}</td>
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
