import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, SendToBack, Shuffle, UserRoundPlus, X } from 'lucide-react';
import type { BulkAssignAssignmentType } from '../../../types/lead.types';

interface BulkAssignConfirmModalProps {
  isOpen: boolean;
  previewCount: number;
  assignmentType: BulkAssignAssignmentType;
  assigneeLabels: string[];
  filtersSummary: string[];
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const BulkAssignConfirmModal: React.FC<BulkAssignConfirmModalProps> = ({
  isOpen,
  previewCount,
  assignmentType,
  assigneeLabels,
  filtersSummary,
  isSubmitting,
  onClose,
  onConfirm,
}) => (
  <AnimatePresence>
    {isOpen ? (
      <div className="fixed inset-0 z-[140] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-assign-confirm-title"
        >
          <div className="absolute -right-20 -top-16 h-40 w-40 rounded-full bg-emerald-50 blur-3xl opacity-70" />

          <div className="p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  {assignmentType === 'ROUND_ROBIN' ? <Shuffle className="h-5 w-5" /> : <UserRoundPlus className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-gray-400">Confirm Bulk Assignment</p>
                  <h2 id="bulk-assign-confirm-title" className="text-2xl font-black tracking-tight text-gray-900">
                    Review ownership update
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close confirmation modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Matching Leads</div>
                <div className="mt-2 text-3xl font-black text-gray-900">{previewCount}</div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Assignment Type</div>
                <div className="mt-2 text-lg font-black text-gray-900">
                  {assignmentType === 'ROUND_ROBIN' ? 'Round Robin' : 'Single User'}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Selected Assignees</div>
                <div className="mt-2 text-lg font-black text-gray-900">{assigneeLabels.length}</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Filters Applied</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {filtersSummary.length ? (
                    filtersSummary.map((item) => (
                      <span key={item} className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-bold text-gray-700">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-semibold text-gray-500">No filters applied. All eligible active leads in scope will be assigned.</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">Assignees</div>
                <div className="mt-3 space-y-2">
                  {assigneeLabels.map((label) => (
                    <div key={label} className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-gray-700 shadow-sm">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-[11px] font-bold leading-normal text-amber-700">
                This action updates lead ownership in bulk and records both audit logs and per-lead activity history. Eligible closed, LOB, and archived leads remain excluded automatically.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 text-sm font-black text-gray-500 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="flex flex-[1.8] items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-sm font-black text-white shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                <SendToBack className="h-4 w-4" />
                <span>{isSubmitting ? 'Assigning…' : 'Confirm Assignment'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    ) : null}
  </AnimatePresence>
);

export default BulkAssignConfirmModal;
