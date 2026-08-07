import React from 'react';
import { formatCurrency } from '../../../utils/currency';

export interface PipelineWidgetMetrics {
  count: number;
  totalExpectedRevenue: number;
  totalClosedRevenue: number;
  averageRevenue: number;
  secondaryMetric?: number;
  stageBreakdown?: Array<{
    stageId: string;
    name: string;
    color: string;
    count: number;
  }>;
  lastRefreshedAt?: string;
}

interface PipelineWidgetRendererProps {
  displayType: string;
  metricType: string;
  metrics: PipelineWidgetMetrics;
  name?: string;
  className?: string;
}

export const PipelineWidgetRenderer: React.FC<PipelineWidgetRendererProps> = ({
  displayType,
  metricType,
  metrics,
  name,
  className = '',
}) => {
  const count = metrics.count || 0;
  const expectedRevenue = metrics.totalExpectedRevenue || 0;
  const closedRevenue = metrics.totalClosedRevenue || 0;
  const secondaryVal = metrics.secondaryMetric || 0;
  const stageBreakdown = metrics.stageBreakdown || [];

  if (displayType === 'REVENUE_CARD' || metricType.includes('REVENUE')) {
    return (
      <div className={`py-1 ${className}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-gray-900">
            {formatCurrency(expectedRevenue)}
          </span>
          <span className="text-xs font-bold text-gray-400">Expected</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-gray-500 border-t border-gray-100 pt-2.5">
          <span>Closed: <strong className="text-emerald-600 font-black">{formatCurrency(closedRevenue)}</strong></span>
          <span>Count: <strong className="text-gray-900 font-black">{count}</strong></span>
        </div>
      </div>
    );
  }

  if (displayType === 'PERCENTAGE_CARD' || metricType === 'CONVERSION_RATE') {
    return (
      <div className={`py-1 ${className}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-emerald-600">{secondaryVal}%</span>
          <span className="text-xs font-bold text-gray-400">Conversion Rate</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-gray-500 border-t border-gray-100 pt-2.5">
          <span>Matching Leads: <strong className="text-gray-900 font-black">{count}</strong></span>
        </div>
      </div>
    );
  }

  if (displayType === 'STAGE_BAR' || metricType === 'STAGE_DISTRIBUTION') {
    return (
      <div className={`py-1 ${className}`}>
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-gray-700">
          <span>Stage Distribution</span>
          <span className="text-base font-black text-gray-900">{count} Leads</span>
        </div>
        {stageBreakdown.length > 0 ? (
          <div className="space-y-2.5">
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
              {stageBreakdown.map((sb, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${count > 0 ? (sb.count / count) * 100 : 0}%`,
                    backgroundColor: sb.color || '#10b981',
                  }}
                  title={`${sb.name}: ${sb.count}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold text-gray-600">
              {stageBreakdown.map((sb, idx) => (
                <span key={idx} className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sb.color || '#10b981' }} />
                  {sb.name} ({sb.count})
                </span>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs font-semibold text-gray-400">No stage distribution data</p>
        )}
      </div>
    );
  }

  if (displayType === 'HORIZONTAL_BAR') {
    return (
      <div className={`py-1 space-y-2.5 ${className}`}>
        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
          <span>Lead Breakdown</span>
          <span className="text-emerald-600 font-black">{count} Total</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-16 text-[10px] font-bold text-gray-500 truncate">Total</span>
            <div className="h-3 flex-1 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-black text-gray-700">{count}</span>
          </div>
          {expectedRevenue > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-16 text-[10px] font-bold text-gray-500 truncate">Value</span>
              <div className="h-3 flex-1 bg-emerald-300 rounded-full" style={{ width: '60%' }} />
              <span className="text-[10px] font-black text-gray-700">{formatCurrency(expectedRevenue)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (displayType === 'PROGRESS_BAR') {
    const progressPct = Math.min(100, secondaryVal || (count > 0 ? Math.min(100, Math.round((count / 100) * 100)) : 0));
    return (
      <div className={`py-1 space-y-2.5 ${className}`}>
        <div className="flex justify-between text-xs font-bold text-gray-700">
          <span>Target Goal Progress</span>
          <span className="text-emerald-600 font-black">{progressPct}%</span>
        </div>
        <div className="h-3.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-semibold text-gray-400">
          <span>0 Leads</span>
          <span>{count} Matching Leads</span>
        </div>
      </div>
    );
  }

  if (displayType === 'STATUS_CARD' || metricType === 'OVERDUE_FOLLOWUP_COUNT' || metricType === 'LOB_COUNT') {
    return (
      <div className={`py-1 ${className}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-amber-600">{secondaryVal || count}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {metricType === 'OVERDUE_FOLLOWUP_COUNT' ? 'Overdue Follow-Ups' : 'Attention Required'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-gray-500 border-t border-gray-100 pt-2.5">
          <span>Total Scope: <strong className="text-gray-900 font-black">{count}</strong></span>
        </div>
      </div>
    );
  }

  if (displayType === 'MINI_TABLE') {
    return (
      <div className={`py-1 space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-xs font-bold text-gray-700">
          <span>Summary Breakdown</span>
          <span className="text-emerald-600 font-black">{count} Leads</span>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-2.5 text-xs font-semibold space-y-1.5">
          <div className="flex justify-between text-gray-600">
            <span>Matching Leads</span>
            <strong className="text-gray-900">{count}</strong>
          </div>
          {expectedRevenue > 0 && (
            <div className="flex justify-between text-gray-600 border-t border-gray-200/60 pt-1.5">
              <span>Expected Value</span>
              <strong className="text-emerald-700">{formatCurrency(expectedRevenue)}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: COMPACT_CARD (Number Card)
  return (
    <div className={`py-1 ${className}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-black text-gray-900">{count}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Matching Leads</span>
      </div>
      {expectedRevenue > 0 && (
        <p className="mt-2 text-xs font-bold text-emerald-600">
          Revenue Value: {formatCurrency(expectedRevenue)}
        </p>
      )}
    </div>
  );
};
