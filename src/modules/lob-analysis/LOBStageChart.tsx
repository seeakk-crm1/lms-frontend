import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { LOBAnalysisSummary, LOBStageBreakdown } from './types/lobAnalysis.types';

interface LOBStageChartProps {
  breakdown?: LOBStageBreakdown;
  summary?: LOBAnalysisSummary;
  loading?: boolean;
}

const colors = ['#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#14b8a6'];

const LOBStageChart: React.FC<LOBStageChartProps> = ({ breakdown, summary, loading }) => {
  const chartData = useMemo(() => {
    if (summary?.stage_wise?.length) {
      return summary.stage_wise.map((item) => ({
        stage: item.stage,
        count: item.count,
      }));
    }

    if (breakdown?.labels?.length && breakdown?.lob_counts?.length) {
      return breakdown.labels.map((label, index) => ({
        stage: label,
        count: breakdown.lob_counts[index] || 0,
      }));
    }

    return [];
  }, [breakdown, summary]);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-500">Stage Breakdown</p>
          <h2 className="mt-1 text-2xl font-black text-gray-900">Where Leads Are Falling Into LOB</h2>
        </div>
        <div className="rounded-2xl bg-gray-50 px-4 py-2 text-sm font-black text-gray-500">
          {breakdown?.total_reference || summary?.total_leads || 0} leads referenced
        </div>
      </div>

      {loading && !chartData.length ? (
        <div className="h-[320px] animate-pulse rounded-[24px] bg-gray-100" />
      ) : chartData.length ? (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="stage"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 700 }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 700 }} />
              <Tooltip
                cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
                contentStyle={{ borderRadius: 16, borderColor: '#d1fae5', boxShadow: '0 15px 40px -15px rgba(15, 23, 42, 0.25)' }}
              />
              <Bar dataKey="count" radius={[14, 14, 6, 6]}>
                {chartData.map((item, index) => (
                  <Cell key={`${item.stage}-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[320px] items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gray-50 text-center">
          <div>
            <p className="text-lg font-black text-gray-900">No stage breakdown available</p>
            <p className="mt-2 text-sm font-semibold text-gray-500">Try widening the date range or removing one of the filters.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default LOBStageChart;
