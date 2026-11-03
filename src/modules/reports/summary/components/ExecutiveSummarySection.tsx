import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOverviewCard, SummaryFilters } from '../../../../services/summaryReports.api';
import { Briefcase, CheckCircle, IndianRupee, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../../../utils/currency';

interface ExecutiveSummarySectionProps {
  filters: SummaryFilters;
}

const ExecutiveSummarySection: React.FC<ExecutiveSummarySectionProps> = ({ filters }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['summary-overview', filters],
    queryFn: () => fetchOverviewCard(filters),
  });

  if (isLoading) {
    return <div className="h-28 bg-gray-100/80 animate-pulse rounded-xl border border-gray-200/80" />;
  }
  if (!data) return null;

  return (
    <div className="space-y-3 sm:space-y-3.5">
      {/* Executive Insight banner */}
      {data.aiInsight && (
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-purple-50/50 p-3 sm:p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs border border-indigo-100 text-indigo-600">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">Executive Insight</p>
            <p className="mt-0.5 text-xs font-medium text-indigo-950 leading-relaxed">{data.aiInsight}</p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <div className="h-[74px] sm:h-[78px] rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs flex items-center gap-3 hover:border-gray-300 transition-all">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Briefcase size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">Leads Created</p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-gray-900 leading-none truncate">{data.leadsCreated}</p>
          </div>
        </div>

        <div className="h-[74px] sm:h-[78px] rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs flex items-center gap-3 hover:border-gray-300 transition-all">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">Followups Completed</p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-emerald-700 leading-none truncate">{data.followupsCompleted}</p>
          </div>
        </div>

        <div className="h-[74px] sm:h-[78px] rounded-xl border border-gray-200/80 bg-white p-3 shadow-2xs flex items-center gap-3 hover:border-gray-300 transition-all">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <IndianRupee size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">Revenue Generated</p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-gray-900 leading-none truncate">{formatCurrency(data.revenueGenerated)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummarySection;
