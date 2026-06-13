import React from 'react';
import { format } from 'date-fns';
import type { FollowupDetailReportItem } from '../../shared/followupReport.types';

interface FollowupDetailCardProps {
  followup: FollowupDetailReportItem;
}

const FollowupDetailCard: React.FC<FollowupDetailCardProps> = ({ followup }) => {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm print:break-inside-avoid">
      <div className="border-b border-gray-100 pb-4">
        <h3 className="text-base font-black text-gray-900">Followup Details</h3>
        <dl className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
          <div><dt className="font-bold text-gray-500">Lead Name</dt><dd>{followup.leadName}</dd></div>
          <div><dt className="font-bold text-gray-500">Lead ID</dt><dd className="font-mono text-xs">{followup.leadId}</dd></div>
          <div><dt className="font-bold text-gray-500">Assigned User</dt><dd>{followup.assignedUser}</dd></div>
          <div><dt className="font-bold text-gray-500">Followup Type</dt><dd>{followup.followupType}</dd></div>
          <div><dt className="font-bold text-gray-500">Created Date</dt><dd>{followup.createdDate}</dd></div>
          <div><dt className="font-bold text-gray-500">Scheduled Date</dt><dd>{followup.scheduledDate}</dd></div>
          <div><dt className="font-bold text-gray-500">Status</dt><dd className="font-bold capitalize">{followup.status.toLowerCase()}</dd></div>
        </dl>
      </div>

      {followup.notes.length > 0 ? (
        <section className="mt-4 border-b border-gray-100 pb-4">
          <h4 className="text-sm font-black uppercase tracking-wide text-purple-700">Followup Notes</h4>
          <div className="mt-3 space-y-4">
            {followup.notes.map((note) => (
              <div key={`${followup.id}-note-${note.noteNumber}`} className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-black uppercase text-gray-400">Note #{note.noteNumber}</p>
                <p className="mt-1 text-xs text-gray-500">Date: {note.date} · Time: {note.time} · Added By: {note.addedBy}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{note.note}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {followup.completion ? (
        <section className="mt-4 border-b border-gray-100 pb-4">
          <h4 className="text-sm font-black uppercase tracking-wide text-emerald-700">Followup Completion Notes</h4>
          <div className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm text-gray-800">
            <p className="text-xs text-gray-500">
              Completed By: {followup.completion.completedBy} ·{' '}
              {format(new Date(followup.completion.completedAt), 'dd/MM/yyyy hh:mm a')}
            </p>
            <p className="mt-2 whitespace-pre-wrap font-medium">{followup.completion.note || 'No completion note provided.'}</p>
          </div>
        </section>
      ) : null}

      {followup.extensions.length > 0 ? (
        <section className="mt-4 border-b border-gray-100 pb-4">
          <h4 className="text-sm font-black uppercase tracking-wide text-rose-700">Followup Extension Notes</h4>
          <div className="mt-3 space-y-4">
            {followup.extensions.map((ext, index) => (
              <div key={`${followup.id}-ext-${index}`} className="rounded-xl bg-rose-50/60 p-4 text-sm text-gray-800">
                <p><strong>Original Date:</strong> {ext.originalDate}</p>
                <p><strong>Extended To:</strong> {ext.extendedTo}</p>
                <p><strong>Extension Reason:</strong> {ext.reason || 'Not specified'}</p>
                <p><strong>Extended By:</strong> {ext.extendedBy} · {format(new Date(ext.extendedAt), 'dd/MM/yyyy hh:mm a')}</p>
                <p className="mt-2 whitespace-pre-wrap"><strong>Description:</strong> {ext.description || 'No description provided.'}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {followup.timeline.length > 0 ? (
        <section className="mt-4">
          <h4 className="text-sm font-black uppercase tracking-wide text-indigo-700">Followup History Timeline</h4>
          <div className="mt-3 space-y-3">
            {followup.timeline.map((entry, index) => (
              <div key={`${followup.id}-timeline-${index}`} className="border-l-2 border-indigo-200 pl-4">
                <p className="text-xs font-bold text-gray-400">{entry.time} · {entry.date}</p>
                <p className="text-sm font-black text-gray-900">{entry.event}</p>
                {entry.detail ? <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">"{entry.detail}"</p> : null}
                {entry.reason ? <p className="mt-1 text-sm text-gray-600"><strong>Reason:</strong> {entry.reason}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
};

export default FollowupDetailCard;
