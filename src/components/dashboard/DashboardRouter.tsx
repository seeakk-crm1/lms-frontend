import React from 'react';
import Dashboard from '../../pages/Dashboard';
import DashboardLayout from './DashboardLayout';
import useAuthStore from '../../store/useAuthStore';
import { hasAnyPermission, isSuperAdmin } from '../../utils/permissions';

type DashboardMode = 'admin' | 'operations' | 'limited';

const getDashboardMode = (): DashboardMode => {
  const user = useAuthStore.getState().user;

  if (isSuperAdmin(user)) {
    return 'admin';
  }

  if (
    hasAnyPermission(user, ['USERS_VIEW', 'ROLES_VIEW', 'DEPARTMENTS_VIEW', 'SYSTEM_CONFIG', 'LOCATION_MANAGE', 'LOCATION_VIEW'])
  ) {
    return 'admin';
  }

  if (
    hasAnyPermission(user, [
      'LEADS_VIEW_ALL',
      'LEADS_VIEW_OWN',
      'LEADS_VIEW_TEAM',
      'LEADS_CREATE',
      'REPORTS_VIEW',
      'REPORTS_GENERATE',
      'LOB_ANALYSIS_VIEW',
      'LEAD_APPROVAL_VIEW',
    ])
  ) {
    return 'operations';
  }

  return 'limited';
};

const DashboardRouter: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const mode = getDashboardMode();

  if (mode === 'limited') {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl p-6 md:p-8">
            <div className="rounded-[28px] border border-amber-100 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.18)]">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-500">Limited Access</p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Your account is active, but no dashboard modules are assigned yet.</h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500">
                We kept onboarding and login intact. This fallback simply prevents empty or unauthorized widgets from rendering until an admin assigns the
                right permissions to {user?.name || 'this account'}.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <Dashboard mode={mode} />;
};

export default DashboardRouter;
