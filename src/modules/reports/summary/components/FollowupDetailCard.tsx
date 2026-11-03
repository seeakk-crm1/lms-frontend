import React from 'react';
import { format } from 'date-fns';
import type { FollowupDetailReportItem } from '../../shared/followupReport.types';

interface FollowupDetailCardProps {
  followup: FollowupDetailReportItem;
}

const FollowupDetailCard: React.FC<FollowupDetailCardProps> = ({ followup }) => {
  return (
    <article className="rounded-xl border border-gray-200/80 bg-white p-3.5 sm:p-4 shadow-2xs print:break-inside-avoid space-y-3">
      {/* Header and key fields */}
      <div className="border-b border-gray-100 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h4 className="text-xs sm:text-sm font-bold text-gray-900">{followup.leadName}</h4>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              followup.status.toUpperCase() === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : followup.status.toUpperCase() === 'OVERDUE'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            {followup.status.toLowerCase()}
          </span>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Lead ID</dt>
            <dd className="font-mono text-gray-600 truncate mt-0.5">{followup.leadId}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Assigned User</dt>
            <dd className="font-semibold text-gray-800 truncate mt-0.5">{followup.assignedUser}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Followup Type</dt>
            <dd className="font-semibold text-gray-800 truncate mt-0.5">{followup.followupType}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Scheduled</dt>
            <dd className="font-semibold text-gray-800 truncate mt-0.5">{followup.scheduledDate}</dd>
          </div>
        </dl>
      </div>

      {followup.notes.length > 0 && (
        <section className="space-y-2 border-b border-gray-100 pb-3">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Followup Notes</h5>
          <div className="space-y-1.5">
            {followup.notes.map((note) => (
              <div key={`${followup.id}-note-${note.noteNumber}`} className="rounded-lg bg-gray-50/80 p-2.5 text-xs border border-gray-100">
                <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                  <span className="font-bold text-gray-500">Note #{note.noteNumber} by {note.addedBy}</span>
                  <span>{note.date} {note.time}</span>
                </div>
                <p className="whitespace-pre-wrap text-gray-700 font-medium leading-relaxed">{note.note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {followup.completion && (
        <section className="space-y-1.5 border-b border-gray-100 pb-3">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Completion Summary</h5>
          <div className="rounded-lg bg-emerald-50/60 p-2.5 text-xs text-gray-800 border border-emerald-100/80">
            <p className="text-[10px] font-medium text-emerald-800">
              Completed by <span className="font-bold">{followup.completion.completedBy}</span> on{' '}
              {format(new Date(followup.completion.completedAt), 'dd MMM yyyy, hh:mm a')}
            </p>
            <p className="mt-1 whitespace-pre-wrap font-medium text-gray-800">{followup.completion.note || 'No completion note provided.'}</p>
          </div>
        </section>
      )}

      {followup.extensions.length > 0 && (
        <section className="space-y-1.5">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Extension History</h5>
          <div className="space-y-1.5">
            {followup.extensions.map((ext, index) => (
              <div key={`${followup.id}-ext-${index}`} className="rounded-lg bg-amber-50/50 p-2 text-xs text-gray-800 border border-amber-100/80">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-amber-900">
                  <span>Extended by {ext.extendedBy}:</span>
                  <span>{ext.originalDate} → {ext.extendedTo}</span>
                </div>
                {ext.reason && <p className="text-[11px] text-gray-600 mt-0.5">Reason: {ext.reason}</p>}
                {ext.description && <p className="text-[11px] text-gray-600 mt-0.5">{ext.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};

export default FollowupDetailCard;
