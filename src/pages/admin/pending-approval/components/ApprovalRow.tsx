import React, { memo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckCircle2, History } from 'lucide-react';
import type { LeadApprovalListItem } from '../../../../types/lead.types';
import StatusBadge from './StatusBadge';

interface ApprovalRowProps {
  approval: LeadApprovalListItem;
  canAct: boolean;
  onReview: (approval: LeadApprovalListItem) => void;
  onHistory: (approval: LeadApprovalListItem) => void;
}

const ApprovalRow: React.FC<ApprovalRowProps> = ({ approval, canAct, onReview, onHistory }) => {
  const isPending = approval.status === 'PENDING';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group transition-colors hover:bg-amber-50/35"
    >
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onReview(approval)}
            disabled={!isPending || !canAct}
            className={`rounded-2xl p-2 transition-all ${
              isPending && canAct
                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                : 'cursor-not-allowed bg-gray-100 text-gray-300'
            }`}
            aria-label={`Review ${approval.lead?.name || 'approval request'}`}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onHistory(approval)}
            className="rounded-2xl bg-slate-50 p-2 text-slate-600 transition-all hover:bg-slate-100"
            aria-label={`View approval history for ${approval.lead?.name || 'request'}`}
          >
            <History className="h-4 w-4" />
          </button>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="max-w-[220px]">
          <div className="truncate text-sm font-black text-gray-900">{approval.lead?.name || 'Unknown lead'}</div>
          <div className="mt-1 text-xs font-semibold text-gray-500">
            {approval.lead?.email || approval.lead?.phone || 'No contact details'}
          </div>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="text-sm font-black text-gray-900">
          {approval.assignedTo?.displayName || approval.assignedTo?.name || 'Open queue'}
        </div>
        <div className="text-xs font-semibold text-gray-400">{approval.requestedBy?.displayName || approval.requestedBy?.name || 'Unknown requester'}</div>
      </td>

      <td className="px-6 py-5 text-sm font-semibold text-gray-600">{approval.fromStage?.name || 'Unknown'}</td>
      <td className="px-6 py-5 text-sm font-semibold text-gray-600">{approval.toStage?.name || 'Unknown'}</td>
      <td className="px-6 py-5">
        <StatusBadge status={approval.status} />
      </td>
      <td className="px-6 py-5">
        <div className="text-sm font-black text-gray-900">{format(new Date(approval.createdAt), 'dd MMM yyyy')}</div>
        <div className="text-xs font-semibold text-gray-400">{format(new Date(approval.createdAt), 'hh:mm a')}</div>
      </td>
      <td className="px-6 py-5">
        <div className="text-sm font-black text-gray-900">{format(new Date(approval.updatedAt), 'dd MMM yyyy')}</div>
        <div className="text-xs font-semibold text-gray-400">{format(new Date(approval.updatedAt), 'hh:mm a')}</div>
      </td>
    </motion.tr>
  );
};

export default memo(ApprovalRow);
