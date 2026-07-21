import React from 'react';
import { useLeadLatestActivityQuery } from '../../hooks/useLeadLatestActivity';
import { format } from 'date-fns';
import { FileText, MessageSquare, Loader2 } from 'lucide-react';

interface Props {
  leadId: string | null;
}

const FollowUpActivityContextCard: React.FC<Props> = ({ leadId }) => {
  const { data, isLoading, error } = useLeadLatestActivityQuery(leadId);

  if (!leadId) return null;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mt-4 flex items-center justify-center min-h-[100px]">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { latestFollowUpNote, latestLeadRemark } = data;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mt-4 space-y-5">
      {/* Follow-up Note Section */}
      <div>
        <h5 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2.5">
          <FileText className="h-3.5 w-3.5" /> Last Follow-up Note
        </h5>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          {latestFollowUpNote ? (
            <div className="flex flex-col">
              <p className="text-xs font-semibold text-gray-700 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                {latestFollowUpNote.text}
              </p>
              <div className="mt-2.5 pt-2 border-t border-gray-100/60 flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Added</span>
                <span className="text-[10px] font-semibold text-gray-500">
                  {format(new Date(latestFollowUpNote.createdAt), 'dd MMM yyyy')}
                  <br />
                  {format(new Date(latestFollowUpNote.createdAt), 'h:mm a')}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs font-medium text-gray-400 italic">No follow-up notes available.</p>
          )}
        </div>
      </div>

      {/* Lead Remark Section */}
      <div>
        <h5 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2.5">
          <MessageSquare className="h-3.5 w-3.5" /> Last Lead Remark
        </h5>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          {latestLeadRemark ? (
            <div className="flex flex-col">
              <p className="text-xs font-semibold text-gray-700 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                {latestLeadRemark.text}
              </p>
              <div className="mt-2.5 pt-2 border-t border-gray-100/60 flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Added</span>
                <span className="text-[10px] font-semibold text-gray-500">
                  {format(new Date(latestLeadRemark.createdAt), 'dd MMM yyyy')}
                  <br />
                  {format(new Date(latestLeadRemark.createdAt), 'h:mm a')}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs font-medium text-gray-400 italic">No remarks available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpActivityContextCard;
