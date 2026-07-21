import React from 'react';
import { useLeadFollowupContext } from '../../hooks/useLeadFollowupContext';
import { FileText, Pin, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  leadId?: string;
}

const FollowUpContextCard: React.FC<Props> = ({ leadId }) => {
  const { data, isLoading } = useLeadFollowupContext(leadId);

  if (!leadId) return null;

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
      <h4 className="mb-3 text-[11px] font-black uppercase tracking-widest text-gray-500">Lead Information</h4>
      
      {isLoading ? (
        <div className="flex items-center gap-2 py-2 text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs font-semibold">Loading context...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              Last Lead Remarks
            </div>
            <p className="mt-1 text-sm font-medium text-gray-600">
              {data?.leadRemarks ? data.leadRemarks : 'No remarks available.'}
            </p>
          </div>

          <div className="h-px bg-gray-200" />

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Pin className="h-3.5 w-3.5 text-rose-500" />
              Last Follow-up Note
            </div>
            <p className="mt-1 text-sm font-medium text-gray-600">
              {data?.lastCompletedFollowup?.note ? data.lastCompletedFollowup.note : 'No previous follow-up available.'}
            </p>
            {data?.lastCompletedFollowup && (
              <div className="mt-2 flex flex-col gap-0.5 text-[10px] font-semibold text-gray-400">
                <span>Completed by: {data.lastCompletedFollowup.completedBy}</span>
                <span>{format(new Date(data.lastCompletedFollowup.completedAt), "dd MMM yyyy • hh:mm a")}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpContextCard;
