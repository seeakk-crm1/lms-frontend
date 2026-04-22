import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Layers3, SendToBack, UsersRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useBulkAssignMutation, useBulkPreviewQuery } from '../../hooks/useBulkAssign';
import { useLeadMetaQuery } from '../../hooks/useLeads';
import useBulkAssignStore from '../../store/bulkAssignStore';
import BulkAssignActions from './components/BulkAssignActions';
import BulkAssignConfirmModal from './components/BulkAssignConfirmModal';
import BulkAssignFilters from './components/BulkAssignFilters';
import BulkAssignPreview from './components/BulkAssignPreview';

const BulkAssignPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    filters,
    appliedFilters,
    hasApplied,
    assignmentType,
    selectedAssignee,
    selectedAssigneeIds,
    previewCount,
    previewLeads,
    lastResult,
    progress,
    setFilters,
    applyFilters,
    resetFilters,
    setAssignmentType,
    setAssignee,
    addRoundRobinAssignee,
    removeRoundRobinAssignee,
    setLoading,
    setProgress,
  } = useBulkAssignStore();

  const { data: meta } = useLeadMetaQuery();
  const previewQuery = useBulkPreviewQuery();
  const bulkAssignMutation = useBulkAssignMutation();

  useEffect(() => {
    setLoading(previewQuery.isLoading || previewQuery.isFetching);
  }, [previewQuery.isFetching, previewQuery.isLoading, setLoading]);

  const stats = useMemo(
    () => [
      { label: 'Preview Ready', value: hasApplied ? 'Yes' : 'No', accent: 'from-emerald-500 to-emerald-600' },
      { label: 'Matching Leads', value: previewCount ?? 0, accent: 'from-blue-500 to-blue-600' },
      {
        label: 'Assignment Mode',
        value:
          assignmentType === 'ROUND_ROBIN'
            ? `${selectedAssigneeIds.length || 0} Users`
            : selectedAssignee
              ? 'Single User'
              : 'Pending',
        accent: 'from-amber-500 to-orange-500',
      },
    ],
    [assignmentType, hasApplied, previewCount, selectedAssignee, selectedAssigneeIds.length],
  );

  const assigneeLabels = useMemo(() => {
    const userMap = new Map((meta?.users || []).map((user) => [user.id, user.label]));
    return assignmentType === 'ROUND_ROBIN'
      ? selectedAssigneeIds.map((id) => userMap.get(id) || id)
      : selectedAssignee
        ? [userMap.get(selectedAssignee) || selectedAssignee]
        : [];
  }, [assignmentType, meta?.users, selectedAssignee, selectedAssigneeIds]);

  const filterSummary = useMemo(() => {
    const stage = meta?.stages.find((item) => item.id === appliedFilters.stageId)?.label;
    const owner = meta?.users.find((item) => item.id === appliedFilters.assignedTo)?.label;
    const lifecycle = meta?.lifeCycles.find((item) => item.id === appliedFilters.lifecycleId)?.label;
    const source = meta?.sources.find((item) => item.id === appliedFilters.sourceId)?.label;

    return [
      stage ? `Stage: ${stage}` : null,
      owner ? `Current owner: ${owner}` : null,
      lifecycle ? `Lifecycle: ${lifecycle}` : null,
      source ? `Source: ${source}` : null,
      appliedFilters.followupDateFrom || appliedFilters.followupDateTo
        ? `Follow-up: ${appliedFilters.followupDateFrom || 'Any'} to ${appliedFilters.followupDateTo || 'Any'}`
        : null,
      appliedFilters.createdDateFrom || appliedFilters.createdDateTo
        ? `Created: ${appliedFilters.createdDateFrom || 'Any'} to ${appliedFilters.createdDateTo || 'Any'}`
        : null,
    ].filter(Boolean) as string[];
  }, [appliedFilters, meta]);

  const handleApply = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  const handleReset = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleAssign = useCallback(() => {
    const hasSelection = assignmentType === 'ROUND_ROBIN' ? selectedAssigneeIds.length >= 2 : Boolean(selectedAssignee);

    if (!hasApplied) {
      toast.error('Apply filters before starting a bulk assignment.');
      return;
    }

    if (!previewCount) {
      toast.error('No leads are available for assignment with the current filters.');
      return;
    }

    if (!hasSelection) {
      toast.error(
        assignmentType === 'ROUND_ROBIN'
          ? 'Select at least two active users for round robin distribution.'
          : 'Please select an assignee before bulk assigning leads.',
      );
      return;
    }

    setIsConfirmOpen(true);
  }, [assignmentType, hasApplied, previewCount, selectedAssignee, selectedAssigneeIds.length]);

  const handleConfirmAssign = useCallback(async () => {
    if (!previewCount) return;

    setProgress({
      current: 0,
      total: previewCount,
      status: 'IN_PROGRESS',
      transport: 'SYNC_READY_FOR_WEBSOCKET',
    });

    try {
      await bulkAssignMutation.mutateAsync({
        filters: appliedFilters,
        assignmentType,
        assignTo: assignmentType === 'SINGLE' ? selectedAssignee : undefined,
        assignToIds: assignmentType === 'ROUND_ROBIN' ? selectedAssigneeIds : undefined,
      });

      setIsConfirmOpen(false);
    } catch {
      // The mutation hook already surfaces the user-facing error state.
    }
  }, [appliedFilters, assignmentType, bulkAssignMutation, previewCount, selectedAssignee, selectedAssigneeIds, setProgress]);

  return (
    <DashboardLayout>
        <div className="relative flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar p-4 md:p-8">
          <div className="absolute right-0 top-0 -z-10 h-[420px] w-[760px] bg-gradient-to-bl from-emerald-50 via-transparent to-transparent" />

          <div className="mx-auto max-w-[1480px] space-y-6 md:space-y-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-emerald-600">
                  <SendToBack className="h-3.5 w-3.5" />
                  <span>Mass Ownership Update</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">Bulk Assign Leads</h1>
                <p className="mt-2 max-w-2xl text-sm font-semibold text-gray-500">
                  Filter active leads, preview the impact, and reassign them in one controlled workspace-safe action.
                </p>
              </motion.div>

              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={`inline-flex items-center justify-center gap-2 self-start rounded-2xl px-5 py-3 text-sm font-black transition-all ${
                  showFilters
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10'
                    : 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className={`h-1.5 bg-gradient-to-r ${stat.accent}`} />
                  <div className="p-5">
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">{stat.label}</div>
                    <div className="mt-3 text-4xl font-black tracking-tight text-gray-900">{stat.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {showFilters ? (
              <BulkAssignFilters
                filters={filters}
                meta={meta}
                isApplying={previewQuery.isLoading || previewQuery.isFetching}
                onFilterChange={setFilters}
                onApply={handleApply}
                onReset={handleReset}
              />
            ) : null}

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <BulkAssignPreview
                previewCount={previewCount}
                previewLeads={previewLeads}
                isLoading={previewQuery.isLoading || previewQuery.isFetching}
                hasApplied={hasApplied}
                filters={appliedFilters}
                meta={meta}
              />

              <BulkAssignActions
                assignmentType={assignmentType}
                selectedAssignee={selectedAssignee}
                selectedAssigneeIds={selectedAssigneeIds}
                previewCount={previewCount}
                hasApplied={hasApplied}
                meta={meta}
                isSubmitting={bulkAssignMutation.isPending}
                progress={progress}
                lastResult={lastResult}
                onAssignmentTypeChange={setAssignmentType}
                onAssigneeChange={setAssignee}
                onRoundRobinAdd={addRoundRobinAssignee}
                onRoundRobinRemove={removeRoundRobinAssignee}
                onAssign={handleAssign}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">How it works</h3>
                    <p className="text-sm font-semibold text-gray-500">Apply filters, preview the count, then assign in one step.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm font-semibold text-gray-600">
                  <p>1. Select any combination of stage, owner, lifecycle, source, and date ranges.</p>
                  <p>2. Preview how many active leads match the criteria in your workspace.</p>
                  <p>3. Select the assignee and run the bulk update.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <UsersRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">Safety checks</h3>
                    <p className="text-sm font-semibold text-gray-500">Only active leads are eligible, and every bulk action is audited.</p>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm font-semibold text-gray-600">
                  <p>Closed, LOB, and archived leads are excluded automatically.</p>
                  <p>Inactive assignees cannot be selected through the assignment dropdown.</p>
                  <p>The backend records both bulk audit data and per-lead activity history.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      <BulkAssignConfirmModal
        isOpen={isConfirmOpen}
        previewCount={previewCount ?? 0}
        assignmentType={assignmentType}
        assigneeLabels={assigneeLabels}
        filtersSummary={filterSummary}
        isSubmitting={bulkAssignMutation.isPending}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAssign}
      />
    </DashboardLayout>
  );
};

export default BulkAssignPage;
