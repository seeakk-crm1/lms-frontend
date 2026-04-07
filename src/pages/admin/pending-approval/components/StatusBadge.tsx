import React from 'react';
import type { LeadApprovalStatus } from '../../../../types/lead.types';

const toneMap: Record<LeadApprovalStatus, string> = {
  PENDING: 'border-amber-100 bg-amber-50 text-amber-700',
  APPROVED: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  DENIED: 'border-rose-100 bg-rose-50 text-rose-700',
};

const StatusBadge: React.FC<{ status: LeadApprovalStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] ${toneMap[status]}`}
  >
    {status}
  </span>
);

export default StatusBadge;
