import React from 'react';
import { AlertTriangle, PieChart, Target, TrendingDown } from 'lucide-react';
import type { LOBAnalysisSummary } from './types/lobAnalysis.types';

interface LOBKPIStatsProps {
  data?: LOBAnalysisSummary;
  loading?: boolean;
}

const LOBKPIStats: React.FC<LOBKPIStatsProps> = ({ data, loading }) => {
  if (loading && !data) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[76px] sm:h-[80px] rounded-xl border border-gray-200/80 bg-white p-3 sm:p-3.5 shadow-2xs animate-pulse"
          />
        ))}
      </section>
    );
  }

  const topStage = data?.stage_wise?.[0];
  const lobPercentage = data?.lob_percentage || 0;
  const percentageTone =
    lobPercentage >= 35
      ? 'text-rose-600 bg-rose-50 border-rose-100'
      : lobPercentage >= 20
        ? 'text-amber-600 bg-amber-50 border-amber-100'
        : 'text-emerald-600 bg-emerald-50 border-emerald-100';

  const cards = [
    {
      label: 'Total Leads',
      value: (data?.total_leads ?? 0).toLocaleString(),
      icon: Target,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-100',
      valueColor: 'text-blue-700',
      subtitle: 'Reference base',
    },
    {
      label: 'LOB Leads',
      value: (data?.total_lob_leads ?? 0).toLocaleString(),
      icon: TrendingDown,
      iconColor: 'text-rose-600 bg-rose-50 border-rose-100',
      valueColor: 'text-rose-700',
      subtitle: 'Filtered exits',
    },
    {
      label: 'LOB Percentage',
      value: `${lobPercentage}%`,
      icon: PieChart,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      valueColor: 'text-gray-900',
      subtitle: lobPercentage >= 35 ? 'High risk' : lobPercentage >= 20 ? 'Watch closely' : 'Healthy',
      badgeTone: percentageTone,
    },
    {
      label: 'Top Exit Stage',
      value: topStage?.stage || 'No data',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
      valueColor: 'text-gray-900',
      subtitle: topStage ? `${topStage.count} events` : 'Awaiting data',
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="h-[76px] sm:h-[80px] rounded-xl border border-gray-200/80 bg-white p-3 sm:p-3.5 shadow-2xs flex items-center justify-between hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${card.iconColor}`}
              >
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-500 truncate">
                  {card.label}
                </div>
                <div
                  className={`text-lg sm:text-xl font-black ${card.valueColor} tracking-tight leading-none mt-1 truncate`}
                  title={String(card.value)}
                >
                  {card.value}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex shrink-0 ml-2">
              {card.badgeTone ? (
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${card.badgeTone}`}
                >
                  {card.subtitle}
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-gray-400">
                  {card.subtitle}
                </span>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
};

export default LOBKPIStats;
