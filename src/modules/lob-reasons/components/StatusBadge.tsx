import React from 'react';
import type { LOBReasonStatus } from '../types/lobReason.types';

const styles: Record<LOBReasonStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  INACTIVE: 'bg-gray-200 text-gray-500',
};

const labels: Record<LOBReasonStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const StatusBadge: React.FC<{ status: LOBReasonStatus }> = ({ status }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${styles[status]}`}>
    {labels[status]}
  </span>
);

export default StatusBadge;
