import React from 'react';
import { ListOrdered } from 'lucide-react';
import type { LOBSummaryReasonItem } from './types/lobAnalysis.types';

interface LOBReasonsListProps {
  data: LOBSummaryReasonItem[];
  loading?: boolean;
}

const LOBReasonsList: React.FC<LOBReasonsListProps> = ({ data, loading }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="mb-3.5 flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100/80">
            <ListOrdered size={15} />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-gray-900">Top LOB Reasons</h2>
            <p className="text-[11px] text-gray-500">Primary exit causes ranked by frequency</p>
          </div>
        </div>

        {loading && !data.length ? (
          <div className="space-y-2.5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-50 border border-gray-100" />
            ))}
          </div>
        ) : data.length ? (
          <div className="space-y-2">
            {data.slice(0, 6).map((item, index) => {
              const percent = total > 0 ? Math.max(8, Math.round((item.count / total) * 100)) : 0;
              return (
                <div
                  key={item.reason}
                  className="rounded-lg border border-gray-100 bg-gray-50/70 p-2.5 transition-colors hover:bg-gray-50/90"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gray-500 border border-gray-200/80 shadow-2xs">
                        {index + 1}
                      </span>
                      <p className="text-xs font-bold text-gray-800 truncate" title={item.reason}>
                        {item.reason}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-md bg-white border border-gray-200/80 px-2 py-0.5 text-xs font-bold text-gray-700 shadow-2xs">
                      {item.count}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-[260px] sm:h-[280px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4 text-center">
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-800">No reason data found</p>
              <p className="mt-1 text-xs text-gray-500">LOB reasons will appear here once matching events exist.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LOBReasonsList;
