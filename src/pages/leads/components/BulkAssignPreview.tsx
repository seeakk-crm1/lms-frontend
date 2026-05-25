import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, DatabaseZap, Info, UsersRound } from 'lucide-react';
import type { BulkAssignFilters, BulkAssignPreviewLead, LeadMetaOptions } from '../../../types/lead.types';
import useBulkAssignStore from '../../../store/bulkAssignStore';

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
  const { selectedLeadIds, toggleLeadSelection, toggleAllLeadsSelection } = useBulkAssignStore();
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
  const previewReady = hasApplied;
  const allVisibleSelected = previewLeads.length > 0 && previewLeads.every((lead) => selectedLeadIds.includes(lead.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm min-h-[640px]"
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

      <div className="mt-5">
        <div className="inline-flex items-center gap-3 rounded-3xl bg-emerald-50 px-4 py-3">
          <UsersRound className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-black text-emerald-700">
            {previewReady
              ? previewCount
                ? `${previewCount} lead${previewCount === 1 ? '' : 's'} will be assigned`
                : 'No eligible leads found'
              : 'Preview your matching leads'}
          </span>
          <span className="text-3xl font-black tracking-tight text-emerald-700">{previewReady ? previewCount ?? 0 : '--'}</span>
        </div>

        <p className="mt-4 text-sm font-semibold text-gray-500">
          {previewReady
            ? previewCount
              ? 'These active leads match the selected filters and can be reassigned in a single action.'
              : 'No active leads matched the selected filters. Adjust the filters and try again.'
            : 'Apply filters to load matching leads into this preview without changing the page layout.'}
        </p>

        <div className="mt-5 grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
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
              <p className="text-sm font-semibold leading-6 text-gray-500">
                {previewReady
                  ? 'No specific filters were applied, so the preview includes all eligible active leads in the current workspace scope.'
                  : 'Applied filters will appear here once you run the preview.'}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gray-50/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() => toggleAllLeadsSelection()}
                  disabled={!previewReady || previewLeads.length === 0}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Select All</div>
              </div>
              <div className="text-xs font-bold text-gray-500">
                {selectedLeadIds.length > 0
                  ? `${selectedLeadIds.length} selected (${previewLeads.length} visible)`
                  : previewReady
                    ? `Showing ${previewLeads.length} of ${previewCount ?? 0}`
                    : 'Waiting for filters'}
              </div>
            </div>

            <div className="min-h-[360px]">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 rounded-2xl bg-white" />
                  <div className="h-20 rounded-2xl bg-white" />
                  <div className="h-20 rounded-2xl bg-white" />
                  <div className="h-20 rounded-2xl bg-white" />
                </div>
              ) : previewLeads.length ? (
                <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                  {previewLeads.map((lead) => {
                    const isSelected = selectedLeadIds.includes(lead.id);
                    return (
                      <div
                        key={lead.id}
                        onClick={() => toggleLeadSelection(lead.id)}
                        className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm cursor-pointer transition-all ${
                          isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-white bg-white hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleLeadSelection(lead.id);
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-black text-gray-900">{lead.name}</div>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
                              {lead.stage ? <span>{lead.stage.name}</span> : null}
                              {lead.source ? <span>{lead.source.name}</span> : null}
                              {lead.lifecycle ? <span>{lead.lifecycle.name}</span> : null}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-xs font-semibold text-gray-500">
                          <div>{lead.assignedTo?.label || 'Unassigned'}</div>
                          <div className="mt-1">{new Date(lead.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                    <Info className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-lg font-black text-gray-900">
                    {previewReady ? 'No matching leads' : 'Preview your target leads'}
                  </h4>
                  <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-gray-500">
                    {previewReady
                      ? 'Adjust the filters to see more eligible active leads inside this preview section.'
                      : 'Apply filters to preview how many active leads will be assigned before making changes.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(BulkAssignPreview);
