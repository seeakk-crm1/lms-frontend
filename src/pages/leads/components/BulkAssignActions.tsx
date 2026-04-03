import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, SendToBack, Shuffle, UserRoundPlus, X } from 'lucide-react';
import SearchableSelect from '../../../components/SearchableSelect';
import type {
  BulkAssignAssignmentType,
  BulkAssignProgress,
  BulkAssignResultSummary,
  LeadMetaOptions,
} from '../../../types/lead.types';

interface BulkAssignActionsProps {
  assignmentType: BulkAssignAssignmentType;
  selectedAssignee: string;
  selectedAssigneeIds: string[];
  previewCount: number | null;
  hasApplied: boolean;
  meta?: LeadMetaOptions;
  isSubmitting?: boolean;
  progress: BulkAssignProgress;
  lastResult: BulkAssignResultSummary | null;
  onAssignmentTypeChange: (value: BulkAssignAssignmentType) => void;
  onAssigneeChange: (value: string) => void;
  onRoundRobinAdd: (value: string) => void;
  onRoundRobinRemove: (value: string) => void;
  onAssign: () => void;
}

const BulkAssignActions: React.FC<BulkAssignActionsProps> = ({
  assignmentType,
  selectedAssignee,
  selectedAssigneeIds,
  previewCount,
  hasApplied,
  meta,
  isSubmitting = false,
  progress,
  lastResult,
  onAssignmentTypeChange,
  onAssigneeChange,
  onRoundRobinAdd,
  onRoundRobinRemove,
  onAssign,
}) => {
  const [roundRobinCandidate, setRoundRobinCandidate] = useState('');

  const isRoundRobin = assignmentType === 'ROUND_ROBIN';
  const selectedUsers = useMemo(
    () => (meta?.users || []).filter((user) => selectedAssigneeIds.includes(user.id)),
    [meta?.users, selectedAssigneeIds],
  );
  const availableRoundRobinOptions = useMemo(
    () =>
      (meta?.users || [])
        .filter((user) => !selectedAssigneeIds.includes(user.id))
        .map((item) => ({ value: item.id, label: item.label })),
    [meta?.users, selectedAssigneeIds],
  );
  const isSelectionReady = isRoundRobin ? selectedAssigneeIds.length >= 2 : Boolean(selectedAssignee);
  const canAssign = hasApplied && Boolean(previewCount) && isSelectionReady && !isSubmitting;

  return (
  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <UserRoundPlus className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Assign Leads</p>
        <h3 className="text-lg font-black text-gray-900">Choose the new owner</h3>
      </div>
    </div>

    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onAssignmentTypeChange('SINGLE')}
        className={`rounded-2xl border px-4 py-3 text-left transition-all ${
          assignmentType === 'SINGLE'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
        }`}
      >
        <div className="text-sm font-black">Assign to single user</div>
        <div className="mt-1 text-xs font-semibold">Every matching lead moves to one owner.</div>
      </button>

      <button
        type="button"
        onClick={() => onAssignmentTypeChange('ROUND_ROBIN')}
        className={`rounded-2xl border px-4 py-3 text-left transition-all ${
          assignmentType === 'ROUND_ROBIN'
            ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-black">
          <Shuffle className="h-4 w-4" />
          Round robin distribution
        </div>
        <div className="mt-1 text-xs font-semibold">Spread leads evenly across multiple active users.</div>
      </button>
    </div>

    <div className="mt-5 grid gap-4">
      <div>
        <label className="mb-2 block text-sm font-black text-gray-900">
          {isRoundRobin ? 'Round Robin Assignees' : 'Assign Leads To'}
        </label>

        {isRoundRobin ? (
          <div className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_120px]">
              <SearchableSelect
                name="bulkAssignRoundRobinUser"
                value={roundRobinCandidate}
                options={availableRoundRobinOptions}
                placeholder="Add assignee"
                onChange={(event) => setRoundRobinCandidate(event.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  if (!roundRobinCandidate) return;
                  onRoundRobinAdd(roundRobinCandidate);
                  setRoundRobinCandidate('');
                }}
                disabled={!roundRobinCandidate}
                className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-black text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Add User
              </button>
            </div>

            {selectedUsers.length ? (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <span
                    key={user.id}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700"
                  >
                    {user.label}
                    <button
                      type="button"
                      onClick={() => onRoundRobinRemove(user.id)}
                      className="rounded-full p-0.5 text-blue-500 transition-colors hover:bg-blue-100 hover:text-blue-700"
                      aria-label={`Remove ${user.label}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold text-gray-500">
                Add at least two active users to distribute matching leads evenly.
              </p>
            )}
          </div>
        ) : (
          <SearchableSelect
            name="bulkAssignUser"
            value={selectedAssignee}
            options={(meta?.users || []).map((item) => ({ value: item.id, label: item.label }))}
            placeholder="Select assignee"
            onChange={(event) => onAssigneeChange(event.target.value)}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Progress</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progress.status === 'FAILED' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{
                width:
                  progress.total > 0
                    ? `${Math.min(100, Math.max(6, (progress.current / progress.total) * 100))}%`
                    : progress.status === 'IN_PROGRESS'
                      ? '20%'
                      : '0%',
              }}
            />
          </div>
          <p className="mt-3 text-sm font-semibold text-gray-600">
            {isSubmitting
              ? `Assigning ${progress.current} / ${progress.total || previewCount || 0} leads…`
              : progress.status === 'COMPLETED' || progress.status === 'PARTIAL'
                ? `${progress.current} / ${progress.total} processed`
                : 'Preview matching leads, then confirm the ownership change.'}
          </p>
        </div>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={onAssign}
          disabled={!canAssign}
          className="inline-flex items-center justify-center gap-2 self-end rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendToBack className="h-4 w-4" />}
          {isSubmitting ? 'Assigning…' : 'Review Assignment'}
        </motion.button>
      </div>

      {lastResult ? (
        <div className={`rounded-2xl border p-4 ${lastResult.failedCount ? 'border-amber-200 bg-amber-50/70' : 'border-emerald-200 bg-emerald-50/70'}`}>
          <div className="text-sm font-black text-gray-900">
            {lastResult.updatedCount} lead{lastResult.updatedCount === 1 ? '' : 's'} assigned successfully
            {lastResult.failedCount ? `, ${lastResult.failedCount} skipped` : ''}
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-600">
            {lastResult.assignmentType === 'ROUND_ROBIN'
              ? 'Round-robin distribution completed across the selected users.'
              : 'All matching leads were sent to the selected assignee.'}
          </p>
          {lastResult.failedLeadIds.length ? (
            <details className="mt-3 rounded-xl border border-amber-200 bg-white p-3">
              <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                View failed records
              </summary>
              <div className="mt-2 flex flex-wrap gap-2">
                {lastResult.failedLeadIds.map((leadId) => (
                  <span key={leadId} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    {leadId}
                  </span>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      ) : null}

      <p className="text-sm font-semibold text-gray-500">
        {previewCount
          ? `${previewCount} eligible lead${previewCount === 1 ? '' : 's'} are ready for ${isRoundRobin ? 'round-robin distribution' : 'single-owner reassignment'}.`
          : 'Apply filters first, then choose assignee settings and continue to confirmation.'}
      </p>
    </div>
  </div>
  );
};

export default memo(BulkAssignActions);
