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

  if (isLoading) return <div className="h-40 bg-gray-100 animate-pulse rounded-2xl"></div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* AI Insight */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 flex gap-4">
        <div className="bg-white p-3 rounded-xl shadow-sm h-fit">
          <Sparkles className="text-indigo-500" size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-indigo-900 mb-1">Executive Insight</h3>
          <p className="text-indigo-800 leading-relaxed font-medium">{data.aiInsight}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-600"><Briefcase size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Leads Created</p>
            <p className="text-2xl font-black text-gray-900">{data.leadsCreated}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Followups Completed</p>
            <p className="text-2xl font-black text-gray-900">{data.followupsCompleted}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-amber-50 p-4 rounded-xl text-amber-600"><IndianRupee size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Revenue Generated</p>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(data.revenueGenerated)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummarySection;
