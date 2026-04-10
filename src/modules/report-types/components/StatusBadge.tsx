import React from 'react';
import type { ReportTypeStatus } from '../types/reportType.types';

const statusStyles: Record<ReportTypeStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
};

const StatusBadge: React.FC<{ status: ReportTypeStatus }> = ({ status }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${statusStyles[status]}`}>
    {status}
  </span>
);

export default StatusBadge;
