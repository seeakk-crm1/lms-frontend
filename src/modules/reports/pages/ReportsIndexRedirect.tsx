import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';

const REPORT_SECTIONS = [
  { path: '/reports/activity', permissions: ['REPORTS_VIEW', 'REPORTS_GENERATE'] },
  { path: '/reports/summary', permissions: ['REPORTS_VIEW', 'REPORTS_GENERATE'] },
  { path: '/reports/call-performance', permissions: ['CALL_REPORTS_VIEW_ALL', 'CALL_REPORTS_VIEW_ASSIGNED', 'CALL_REPORTS_VIEW_OWN', 'REPORTS_VIEW', 'SYSTEM_CONFIG'] },
  { path: '/reports/revenue', permissions: ['REPORTS_VIEW', 'REPORTS_GENERATE'] },
  { path: '/reports/leads', permissions: ['REPORTS_VIEW', 'REPORTS_GENERATE'] },
  { path: '/reports/followups', permissions: ['REPORTS_VIEW', 'REPORTS_GENERATE'] },
  { path: '/reports/attendance', permissions: ['REPORTS_VIEW', 'REPORTS_GENERATE'] },
];

export const ReportsIndexRedirect: React.FC = () => {
  const { user } = useAuthStore();
  const userPermissions = (user?.role as any)?.permissions || [];
  const roleName = (user?.role as any)?.name || '';
  const isSuperAdmin = roleName === 'SUPER_ADMIN' || roleName === 'ADMIN';

  const hasPermission = (required: string[]) => {
    if (isSuperAdmin) return true;
    return required.some((p) => userPermissions.includes(p));
  };

  const accessibleSection = REPORT_SECTIONS.find((sec) => hasPermission(sec.permissions));
  const targetPath = accessibleSection ? accessibleSection.path : '/reports/activity';

  return <Navigate to={targetPath} replace />;
};

export default ReportsIndexRedirect;
