import React from 'react';
import { AlertTriangle, PieChart, Target, TrendingDown } from 'lucide-react';
import type { LOBAnalysisSummary } from './types/lobAnalysis.types';

interface LOBKPIStatsProps {
  data?: LOBAnalysisSummary;
  loading?: boolean;
}

const cardSkeleton = 'h-28 animate-pulse rounded-[28px] border border-white/70 bg-white/80';

const LOBKPIStats: React.FC<LOBKPIStatsProps> = ({ data, loading }) => {
  if (loading && !data) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={cardSkeleton} />
        ))}
      </section>
    );
  }

  const topStage = data?.stage_wise?.[0];
  const lobPercentage = data?.lob_percentage || 0;
  const percentageTone =
    lobPercentage >= 35 ? 'text-rose-600 bg-rose-50' : lobPercentage >= 20 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';

  const cards = [
    {
      label: 'Total Leads',
      value: data?.total_leads ?? 0,
      icon: Target,
      chip: 'Reference base',
    },
    {
      label: 'LOB Leads',
      value: data?.total_lob_leads ?? 0,
      icon: TrendingDown,
      chip: 'Filtered events',
    },
    {
      label: 'LOB Percentage',
      value: `${lobPercentage}%`,
      icon: PieChart,
      chip: lobPercentage >= 35 ? 'High risk' : lobPercentage >= 20 ? 'Watch closely' : 'Healthy',
      tone: percentageTone,
    },
    {
      label: 'Top Exit Stage',
      value: topStage?.stage || 'No data',
      icon: AlertTriangle,
      chip: topStage ? `${topStage.count} LOB events` : 'Awaiting data',
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-400">{card.label}</p>
              <p className="mt-4 text-3xl font-black tracking-tight text-gray-950">{card.value}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <card.icon className="h-5 w-5" />
            </div>
          </div>
          <div className={`mt-5 inline-flex rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] ${card.tone || 'bg-gray-50 text-gray-500'}`}>
            {card.chip}
          </div>
        </article>
      ))}
    </section>
  );
};

export default LOBKPIStats;
