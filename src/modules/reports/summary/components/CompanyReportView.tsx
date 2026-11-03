import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanySummary, SummaryFilters } from '../../../../services/summaryReports.api';
import { Building2, Trophy, Coins, Users } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';

interface CompanyReportViewProps {
  filters: SummaryFilters;
}

const CompanyReportView: React.FC<CompanyReportViewProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-company', filters],
    queryFn: () => fetchCompanySummary(filters),
  });

  if (isLoading) {
    return <div className="h-44 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;
  }
  if (!data?.userStats) return null;

  const totalRevenue = data.userStats.reduce((sum: number, u: any) => sum + u.revenueGenerated, 0);
  const totalLeads = data.userStats.reduce((sum: number, u: any) => sum + u.leadsCreated, 0);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200/80">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/80">
          <Building2 size={15} />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-gray-900">Company-Wide Activity Overview</h2>
      </div>

      {/* Compact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
        <div className="h-[76px] sm:h-[80px] rounded-xl border border-gray-200/80 bg-white p-3 sm:p-3.5 shadow-2xs flex items-center justify-between hover:border-gray-300 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100 bg-indigo-50 text-indigo-600">
              <Coins size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">
                Total Revenue Generated
              </div>
              <div className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight leading-none mt-1 truncate">
                {formatCurrency(totalRevenue)}
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-xs font-semibold text-gray-400">
            All users
          </div>
        </div>

        <div className="h-[76px] sm:h-[80px] rounded-xl border border-gray-200/80 bg-white p-3 sm:p-3.5 shadow-2xs flex items-center justify-between hover:border-gray-300 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border border-emerald-100 bg-emerald-50 text-emerald-600">
              <Users size={20} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">
                Total Leads Created
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight leading-none mt-1 truncate">
                {totalLeads.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-xs font-semibold text-gray-400">
            New pipeline
          </div>
        </div>
      </div>

      {/* User Performance Ranking Table */}
      <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-500" size={15} />
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">User Performance Ranking</h3>
          </div>
          <span className="text-[11px] font-semibold text-gray-500">
            {data.userStats.length} {data.userStats.length === 1 ? 'User' : 'Users'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50/90 font-bold border-b border-gray-200/80 tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Rank</th>
                <th className="px-3.5 py-2.5">User</th>
                <th className="px-3.5 py-2.5">Role</th>
                <th className="px-3.5 py-2.5">Branch</th>
                <th className="px-3.5 py-2.5 text-center">Leads Created</th>
                <th className="px-3.5 py-2.5 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.userStats.map((user: any, index: number) => (
                <tr key={user.userId} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-3.5 py-2.5 font-bold text-gray-400">#{index + 1}</td>
                  <td className="px-3.5 py-2.5 font-semibold text-gray-900">{user.name}</td>
                  <td className="px-3.5 py-2.5 text-gray-500">{user.role}</td>
                  <td className="px-3.5 py-2.5 text-gray-500">{user.branch}</td>
                  <td className="px-3.5 py-2.5 text-center font-bold text-gray-800">{user.leadsCreated}</td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-emerald-700">{formatCurrency(user.revenueGenerated)}</td>
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
