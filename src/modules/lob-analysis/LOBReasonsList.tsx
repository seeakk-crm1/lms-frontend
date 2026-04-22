import React from 'react';
import type { LOBSummaryReasonItem } from './types/lobAnalysis.types';

interface LOBReasonsListProps {
  data: LOBSummaryReasonItem[];
  loading?: boolean;
}

const LOBReasonsList: React.FC<LOBReasonsListProps> = ({ data, loading }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.25)] backdrop-blur">
      <div className="mb-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-500">Top Reasons</p>
        <h2 className="mt-1 text-2xl font-black text-gray-900">Why Leads End Up In LOB</h2>
      </div>

      {loading && !data.length ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : data.length ? (
        <div className="space-y-3">
          {data.slice(0, 6).map((item, index) => {
            const percent = total > 0 ? Math.max(8, Math.round((item.count / total) * 100)) : 0;
            return (
              <div key={item.reason} className="rounded-[22px] border border-gray-100 bg-gray-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-gray-900">{item.reason}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Rank #{index + 1}</p>
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-sm font-black text-gray-700 shadow-sm">
                    {item.count}
                  </div>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-lg font-black text-gray-900">No reason data found</p>
          <p className="mt-2 text-sm font-semibold text-gray-500">LOB reasons will appear here once matching events exist.</p>
        </div>
      )}
    </section>
  );
};

export default LOBReasonsList;
