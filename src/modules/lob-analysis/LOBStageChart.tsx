import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3 } from 'lucide-react';
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

  const totalReferenced = breakdown?.total_reference || summary?.total_leads || 0;

  return (
    <section className="rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
      <div className="mb-3.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80">
            <BarChart3 size={15} />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-gray-900">Where Leads Fall Into LOB</h2>
            <p className="text-[11px] text-gray-500">Volume breakdown by lead pipeline stage</p>
          </div>
        </div>
        <div className="text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200/70 rounded-md px-2.5 py-1 self-start sm:self-auto">
          <span className="font-bold text-gray-900">{totalReferenced.toLocaleString()}</span> leads referenced
        </div>
      </div>

      {loading && !chartData.length ? (
        <div className="h-[260px] sm:h-[280px] animate-pulse rounded-lg bg-gray-50 border border-gray-100" />
      ) : chartData.length ? (
        <div className="h-[260px] sm:h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="stage"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(16, 185, 129, 0.04)' }}
                contentStyle={{
                  borderRadius: 8,
                  borderColor: '#e2e8f0',
                  boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.08)',
                  fontSize: 12,
                  padding: '8px 12px',
                }}
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {chartData.map((item, index) => (
                  <Cell key={`${item.stage}-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[260px] sm:h-[280px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-center p-4">
          <div>
            <p className="text-xs sm:text-sm font-bold text-gray-800">No stage breakdown available</p>
            <p className="mt-1 text-xs text-gray-500">Try widening your date range or adjusting applied filters.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default LOBStageChart;
