import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanySummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { Building2, Trophy, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';

interface CompanyReportViewProps {
  filters: SummaryFilters;
}

const CompanyReportView: React.FC<CompanyReportViewProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-company', filters],
    queryFn: () => fetchCompanySummary(filters),
  });

  if (isLoading) return <div className="h-64 bg-gray-100 animate-pulse rounded-2xl mt-8"></div>;
  if (!data?.userStats) return null;

  const totalRevenue = data.userStats.reduce((sum: number, u: any) => sum + u.revenueGenerated, 0);
  const totalLeads = data.userStats.reduce((sum: number, u: any) => sum + u.leadsCreated, 0);

  return (
    <div className="space-y-8 mt-8">
      <div className="flex items-center gap-3 border-b-2 border-indigo-500 pb-3">
        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
          <Building2 size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Company-Wide Activity Report</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100">
          <p className="text-sm font-bold text-indigo-900 mb-1">Total Revenue Generated</p>
          <p className="text-4xl font-black text-indigo-700">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-100">
          <p className="text-sm font-bold text-emerald-900 mb-1">Total Leads Created</p>
          <p className="text-4xl font-black text-emerald-700">{totalLeads.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Trophy className="text-amber-500" size={18} />
          <h3 className="font-bold text-gray-900">User Performance Ranking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-white font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4 text-center">Leads Created</th>
                <th className="px-6 py-4 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody>
              {data.userStats.map((user: any, index: number) => (
                <tr key={user.userId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 font-black text-gray-400">#{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{user.name}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">{user.branch}</td>
                  <td className="px-6 py-4 text-center font-bold">{user.leadsCreated}</td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600">{formatCurrency(user.revenueGenerated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompanyReportView;
