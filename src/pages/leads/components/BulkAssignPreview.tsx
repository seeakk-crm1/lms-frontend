import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, DatabaseZap, Info, UsersRound } from 'lucide-react';
import type { BulkAssignFilters, BulkAssignPreviewLead, LeadMetaOptions } from '../../../types/lead.types';

interface BulkAssignPreviewProps {
  previewCount: number | null;
  previewLeads: BulkAssignPreviewLead[];
  isLoading?: boolean;
  hasApplied: boolean;
  filters: BulkAssignFilters;
  meta?: LeadMetaOptions;
}

const BulkAssignPreview: React.FC<BulkAssignPreviewProps> = ({
  previewCount,
  previewLeads,
  isLoading = false,
  hasApplied,
  filters,
  meta,
}) => {
  const filterSummary = [
    filters.stageId ? `Stage: ${meta?.stages.find((item) => item.id === filters.stageId)?.label || 'Selected'}` : null,
    filters.assignedTo ? `Current owner: ${meta?.users.find((item) => item.id === filters.assignedTo)?.label || 'Selected'}` : null,
    filters.lifecycleId ? `Lifecycle: ${meta?.lifeCycles.find((item) => item.id === filters.lifecycleId)?.label || 'Selected'}` : null,
    filters.sourceId ? `Source: ${meta?.sources.find((item) => item.id === filters.sourceId)?.label || 'Selected'}` : null,
    filters.followupDateFrom || filters.followupDateTo
      ? `Follow-up: ${filters.followupDateFrom || 'Any'} to ${filters.followupDateTo || 'Any'}`
      : null,
    filters.createdDateFrom || filters.createdDateTo
      ? `Created: ${filters.createdDateFrom || 'Any'} to ${filters.createdDateTo || 'Any'}`
      : null,
  ].filter(Boolean) as string[];

  if (!hasApplied) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-200 bg-white/70 p-6 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
          <Info className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-lg font-black text-gray-900">Preview your target leads</h3>
        <p className="mt-2 text-sm font-semibold text-gray-500">
          Apply filters to preview how many active leads will be assigned before making changes.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <DatabaseZap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Preview Results</p>
          <h3 className="text-lg font-black text-gray-900">Bulk assignment target</h3>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-5 animate-pulse space-y-3">
          <div className="h-8 w-32 rounded-xl bg-gray-100" />
          <div className="h-4 w-72 rounded-xl bg-gray-100" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="inline-flex items-center gap-3 rounded-3xl bg-emerald-50 px-4 py-3">
            <UsersRound className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-black text-emerald-700">
              {previewCount ? `${previewCount} lead${previewCount === 1 ? '' : 's'} will be assigned` : 'No eligible leads found'}
            </span>
            <span className="text-3xl font-black tracking-tight text-emerald-700">{previewCount ?? 0}</span>
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-500">
            {previewCount
              ? 'These active leads match the selected filters and can be reassigned in a single action.'
              : 'No active leads matched the selected filters. Adjust the filters and try again.'}
          </p>

          <div className="mt-5 grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-3xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">
                <CalendarClock className="h-3.5 w-3.5" />
                Filter Summary
              </div>
              {filterSummary.length ? (
                <div className="flex flex-wrap gap-2">
                  {filterSummary.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold text-gray-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-500">
                  No filters were applied, so the preview includes all eligible active leads in this workspace scope.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-gray-100 bg-gray-50/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Preview List</div>
                <div className="text-xs font-bold text-gray-500">
                  Showing {previewLeads.length} of {previewCount ?? 0}
                </div>
              </div>

              {previewLeads.length ? (
                <div className="space-y-2">
                  {previewLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-gray-900">{lead.name}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
                          {lead.stage ? <span>{lead.stage.name}</span> : null}
                          {lead.source ? <span>{lead.source.name}</span> : null}
                          {lead.lifecycle ? <span>{lead.lifecycle.name}</span> : null}
                        </div>
                      </div>
                      <div className="text-right text-xs font-semibold text-gray-500">
                        <div>{lead.assignedTo?.label || 'Unassigned'}</div>
                        <div className="mt-1">{new Date(lead.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-500">
                  Apply filters to see a sample of the first matching records before assigning them.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default memo(BulkAssignPreview);
